import clientPromise, { dbName } from "../../../components/mongodb/mongo";
import { getSession } from "next-auth/react";
import { generateImage } from "../../../components/togetherai";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async (req, res) => {
  const session = await getSession({ req });

  const client = await clientPromise;
  const db = client.db(dbName);
  const { id } = req.query;
  const ObjectId = require("mongodb").ObjectId;

  if (session) {
    // POST ================================== Сохраняем имя пользователя с проверкой  ===================================== POST //

    if (req.method === "POST" && req.body.methodic === "uniapisavenickname") {
      try {
        const existName = await db
          .collection("users")
          .find({ name: req.body.name })
          .toArray();

        if (existName.length < 1) {
          db.collection("users").updateOne(
            { _id: new ObjectId(req.body.userId) },
            {
              $set: {
                name: req.body.name,
              },
            }
          );
        } else {
          throw "Username zaneto!";
        }

        res.status(200).json({ stat: "okay" });
      } catch (error) {
        console.error(`There was a problem with POST username change`);
        res.status(400).json({ stat: "notokay" });
      }
    }

    // POST ================================== Удаляем аккаунт пользователя  ===================================== POST //

    if (
      req.method === "POST" &&
      req.body.methodic === "uniapideaccount" &&
      session.user._id === id
    ) {
      try {
        db.collection("users").deleteOne({ _id: new ObjectId(id) });

        res.status(200).json({ stat: "okay" });
      } catch (error) {
        console.error(`There was a problem with DELETE user account`);
        res.status(400).json({ stat: "notokay" });
      }
    }

    // POST ================================== Сохраняем скретч игры  ===================================== POST //

    if (req.method === "POST" && req.body.methodic === "uniapiputgame") {
      try {
        db.collection("users").updateOne(
          { _id: ObjectId(id) },
          { $push: { games: req.body } }
        );

        res.status(200).json({ stat: "okay" });
      } catch (error) {
        console.error(`There was a problem with scratch user game`);
        res.status(400).json({ stat: "notokay" });
      }
    }

    // POST ================================== Удаляем скретч игры  ===================================== POST //

    if (req.method === "POST" && req.body.methodic === "uniapidelscratch") {
      try {
        db.collection("users").updateOne(
          { _id: ObjectId(id) },
          { $pull: { games: { name: req.body.name } } }
        );

        res.status(200).json({ stat: "okay" });
      } catch (error) {
        console.error(`There was a problem with DELETE user scratch`);
        res.status(400).json({ stat: "notokay" });
      }
    }
    // ================================== ADMIN ROUTES ===================================== //

    const isAdmin = session.user.role === "admin";

    // POST ================================== Создаем топ-лист ===================================== POST //

    if (req.method === "POST" && req.body.methodic === "createtoplist" && isAdmin) {
      try {
        const slug = req.body.name
          .toLowerCase()
          .replace(/[^a-zA-Zа-яА-Я0-9\s]/g, "")
          .replace(/\s+/g, "-");

        await db.collection("toplists").insertOne({
          name: req.body.name,
          slug: slug,
          description: req.body.description || "",
          imagePrompt: req.body.imagePrompt || "",
          imageBase64: null,
          imageModel: req.body.imageModel || "black-forest-labs/FLUX.1-schnell",
          games: [],
          isDefault: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        res.status(200).json({ stat: "okay", slug });
      } catch (error) {
        console.error("Error creating toplist");
        res.status(400).json({ stat: "notokay" });
      }
    }

    // POST ================================== Обновляем топ-лист ===================================== POST //

    if (req.method === "POST" && req.body.methodic === "updatetoplist" && isAdmin) {
      try {
        const updateFields = {
          updatedAt: new Date(),
        };
        if (req.body.name !== undefined) updateFields.name = req.body.name;
        if (req.body.description !== undefined) updateFields.description = req.body.description;
        if (req.body.imagePrompt !== undefined) updateFields.imagePrompt = req.body.imagePrompt;
        if (req.body.imageBase64 !== undefined) updateFields.imageBase64 = req.body.imageBase64;

        await db.collection("toplists").updateOne(
          { _id: new ObjectId(id) },
          { $set: updateFields }
        );

        res.status(200).json({ stat: "okay" });
      } catch (error) {
        console.error("Error updating toplist");
        res.status(400).json({ stat: "notokay" });
      }
    }

    // POST ================================== Удаляем топ-лист ===================================== POST //

    if (req.method === "POST" && req.body.methodic === "deletetoplist" && isAdmin) {
      try {
        const list = await db.collection("toplists").findOne({ _id: new ObjectId(id) });
        if (list && list.isDefault) {
          return res.status(400).json({ stat: "notokay", error: "Cannot delete default list" });
        }

        await db.collection("toplists").deleteOne({ _id: new ObjectId(id) });
        res.status(200).json({ stat: "okay" });
      } catch (error) {
        console.error("Error deleting toplist");
        res.status(400).json({ stat: "notokay" });
      }
    }

    // POST ================================== Назначаем дефолтный лист ===================================== POST //

    if (req.method === "POST" && req.body.methodic === "setdefaultlist" && isAdmin) {
      try {
        await db.collection("toplists").updateMany({}, { $set: { isDefault: false } });
        await db.collection("toplists").updateOne(
          { _id: new ObjectId(id) },
          { $set: { isDefault: true } }
        );

        res.status(200).json({ stat: "okay" });
      } catch (error) {
        console.error("Error setting default list");
        res.status(400).json({ stat: "notokay" });
      }
    }

    // POST ================================== Добавляем игру в список ===================================== POST //

    if (req.method === "POST" && req.body.methodic === "addgametolist" && isAdmin) {
      try {
        const game = {
          title: req.body.title,
          slug: (req.body.title || "").replace(/[^a-zA-Z0-9]/g, "_"),
          description: req.body.description || "",
          image: req.body.image || "",
          imagePrompt: req.body.imagePrompt || "",
          imageBase64: null,
          rank: req.body.rank || "",
          rating: req.body.rating || "",
          link: req.body.link || "",
        };

        await db.collection("toplists").updateOne(
          { _id: new ObjectId(id) },
          { $push: { games: game }, $set: { updatedAt: new Date() } }
        );

        res.status(200).json({ stat: "okay" });
      } catch (error) {
        console.error("Error adding game to list");
        res.status(400).json({ stat: "notokay" });
      }
    }

    // POST ================================== Обновляем игру в списке ===================================== POST //

    if (req.method === "POST" && req.body.methodic === "updategameinlist" && isAdmin) {
      try {
        const setFields = {};
        if (req.body.title !== undefined) setFields["games.$.title"] = req.body.title;
        if (req.body.description !== undefined) setFields["games.$.description"] = req.body.description;
        if (req.body.image !== undefined) setFields["games.$.image"] = req.body.image;
        if (req.body.imagePrompt !== undefined) setFields["games.$.imagePrompt"] = req.body.imagePrompt;
        if (req.body.rank !== undefined) setFields["games.$.rank"] = req.body.rank;
        if (req.body.rating !== undefined) setFields["games.$.rating"] = req.body.rating;
        if (req.body.link !== undefined) setFields["games.$.link"] = req.body.link;
        setFields.updatedAt = new Date();

        await db.collection("toplists").updateOne(
          { _id: new ObjectId(id), "games.slug": req.body.gameSlug },
          { $set: setFields }
        );

        res.status(200).json({ stat: "okay" });
      } catch (error) {
        console.error("Error updating game in list");
        res.status(400).json({ stat: "notokay" });
      }
    }

    // POST ================================== Удаляем игру из списка ===================================== POST //

    if (req.method === "POST" && req.body.methodic === "removegamefromlist" && isAdmin) {
      try {
        await db.collection("toplists").updateOne(
          { _id: new ObjectId(id) },
          {
            $pull: { games: { slug: req.body.gameSlug } },
            $set: { updatedAt: new Date() },
          }
        );

        res.status(200).json({ stat: "okay" });
      } catch (error) {
        console.error("Error removing game from list");
        res.status(400).json({ stat: "notokay" });
      }
    }

    // POST ================================== Импорт игр JSON ===================================== POST //

    if (req.method === "POST" && req.body.methodic === "importgames" && isAdmin) {
      try {
        const games = req.body.games.map((g) => ({
          title: g.title || "",
          slug: (g.title || g.slug || "").replace(/[^a-zA-Z0-9]/g, "_"),
          description: g.description || "",
          image: g.image || "",
          imagePrompt: g.imagePrompt || "",
          imageBase64: null,
          rank: g.rank || "",
          rating: g.rating || "",
          link: g.link || "",
        }));

        await db.collection("toplists").updateOne(
          { _id: new ObjectId(id) },
          { $push: { games: { $each: games } }, $set: { updatedAt: new Date() } }
        );

        res.status(200).json({ stat: "okay", count: games.length });
      } catch (error) {
        console.error("Error importing games");
        res.status(400).json({ stat: "notokay" });
      }
    }

    // POST ================================== Генерация обложки списка ===================================== POST //

    if (req.method === "POST" && req.body.methodic === "generatelistimage" && isAdmin) {
      try {
        const adminSettings = await db.collection("settings").findOne({ type: "admin" });
        const styleTags = adminSettings?.styleTags || [];
        const b64 = await generateImage(req.body.prompt, req.body.model, styleTags);
        const imageBase64 = `data:image/png;base64,${b64}`;

        await db.collection("toplists").updateOne(
          { _id: new ObjectId(id) },
          { $set: { imageBase64, imageModel: req.body.model, updatedAt: new Date() } }
        );

        res.status(200).json({ stat: "okay", imageBase64 });
      } catch (error) {
        console.error("Error generating list image:", error.message);
        res.status(400).json({ stat: "notokay", error: error.message });
      }
    }

    // POST ================================== Генерация картинки для игры ===================================== POST //

    if (req.method === "POST" && req.body.methodic === "generategameimage" && isAdmin) {
      try {
        const adminSettings = await db.collection("settings").findOne({ type: "admin" });
        const styleTags = adminSettings?.styleTags || [];
        const b64 = await generateImage(req.body.prompt, req.body.model, styleTags);
        const imageBase64 = `data:image/png;base64,${b64}`;

        // Store image separately to avoid BSON size limit
        await db.collection("images").updateOne(
          { listId: id, gameSlug: req.body.gameSlug },
          { $set: { listId: id, gameSlug: req.body.gameSlug, imageBase64, updatedAt: new Date() } },
          { upsert: true }
        );

        await db.collection("toplists").updateOne(
          { _id: new ObjectId(id), "games.slug": req.body.gameSlug },
          { $set: { "games.$.hasImage": true, updatedAt: new Date() } }
        );

        res.status(200).json({ stat: "okay", imageBase64 });
      } catch (error) {
        console.error("Error generating game image:", error.message);
        res.status(400).json({ stat: "notokay", error: error.message });
      }
    }

    // POST ================================== Сохраняем картинку элемента напрямую ===================================== POST //

    if (req.method === "POST" && req.body.methodic === "savegameimage" && isAdmin) {
      try {
        await db.collection("images").updateOne(
          { listId: id, gameSlug: req.body.gameSlug },
          { $set: { listId: id, gameSlug: req.body.gameSlug, imageBase64: req.body.imageBase64, updatedAt: new Date() } },
          { upsert: true }
        );

        await db.collection("toplists").updateOne(
          { _id: new ObjectId(id), "games.slug": req.body.gameSlug },
          { $set: { "games.$.hasImage": true, updatedAt: new Date() } }
        );

        res.status(200).json({ stat: "okay" });
      } catch (error) {
        console.error("Error saving game image");
        res.status(400).json({ stat: "notokay" });
      }
    }

    // POST ================================== Генерация превью (без сохранения) ===================================== POST //

    if (req.method === "POST" && req.body.methodic === "generatepreview" && isAdmin) {
      try {
        const adminSettings = await db.collection("settings").findOne({ type: "admin" });
        const styleTags = adminSettings?.styleTags || [];
        const b64 = await generateImage(req.body.prompt, req.body.model, styleTags);
        const imageBase64 = `data:image/png;base64,${b64}`;

        res.status(200).json({ stat: "okay", imageBase64 });
      } catch (error) {
        console.error("Error generating preview:", error.message);
        res.status(400).json({ stat: "notokay", error: error.message });
      }
    }

    // POST ================================== Сохраняем настройки ===================================== POST //

    if (req.method === "POST" && req.body.methodic === "savesettings" && isAdmin) {
      try {
        await db.collection("settings").updateOne(
          { type: "admin" },
          {
            $set: {
              imageModel: req.body.imageModel,
              styleTags: req.body.styleTags || [],
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        );

        res.status(200).json({ stat: "okay" });
      } catch (error) {
        console.error("Error saving settings");
        res.status(400).json({ stat: "notokay" });
      }
    }
  } else {
    console.log("No Session");
    res.status(401);
  }

  res.end();
};
