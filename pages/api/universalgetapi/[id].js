import clientPromise, { dbName } from "../../../components/mongodb/mongo";
import { getSession } from "next-auth/react";

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async (req, res) => {
  const session = await getSession({ req });
  const client = await clientPromise;
  const db = client.db(dbName);
  const { id } = req.query;
  let param = req.query.route;
  const ObjectId = require("mongodb").ObjectId;

  // GET ==================== Получаем все стертые игры одного акаунта  =========================== GET //

  if (req.method === "GET" && param == "games") {
    try {
      let today = new Date().toISOString().slice(0, 10);

      function compareNumbers(a, b) {
        return a.rank - b.rank;
      }

      const onedata = await db
        .collection("users")
        .find({ _id: ObjectId(id) })
        .toArray();

      const alldata = await db
        .collection("gameparser")
        .find({ date: today })
        .toArray();

      if (!alldata.length) {
        return res.status(200).json([]);
      }

      alldata[0].games.sort(compareNumbers);

      alldata[0].games.map((game) => {
        for (let item of onedata[0].games) {
          if (item?.name === game?.title) {
            game.scratched = true;
            game.scratchedtime = new Date(item.date).toLocaleDateString();
          }
        }
      });

      res.status(200).json(alldata[0].games);
    } catch (error) {
      console.error(`There was a problem retrieving scratched games`);
      res.status(400).end();
    }
  }

  // GET ==================== Получаем все спаршеные сегодня игры  =========================== GET //

  if (req.method === "GET" && param == "allgames") {
    try {
      let today = new Date().toISOString().slice(0, 10);

      const posts = await db
        .collection("gameparser")
        .find({ date: today })
        .toArray();

      if (!posts.length) {
        return res.status(200).json([]);
      }

      res.status(200).json(posts[0].games);
    } catch (error) {
      console.error(`There was a problem retrieving entries with the query`);
      res.status(400).end();
    }
  }

  // GET ==================== Получаем и агрегируем данные по одной игре  =========================== GET //

  if (req.method === "GET" && param == "gamestat") {
    try {
      const gamestat = await db
        .collection("gameparser")
        .aggregate([
          {
            $unwind: {
              path: "$games",
            },
          },
          {
            $match: {
              "games.slug": id,
            },
          },
          {
            $project: {
              _id: 0,
              name: "$games.title",
              date: "$games.date",
              rate: "$games.rating",
              rank: "$games.rank",
              desc: "$games.description",
            },
          },
        ])
        .toArray();

      res.status(200).json(gamestat);
    } catch (error) {
      console.error(`There was a problem retrieving entries with the query`);
      res.status(400).end();
    }
  }

  // GET ==================== Получаем данные по одному пользовтелю  =========================== GET //

  if (req.method === "GET" && param === "userlog") {
    try {
      const actions = await db
        .collection("users")
        .find({ _id: ObjectId(session.user._id) })
        .toArray();

      res.status(200).json(actions);
    } catch (error) {
      console.error(`There was a problem with GET all user info`);
      res.status(400).end();
    }
  }

  // GET ==================== Получаем ссылки на все игры  =========================== GET //

  if (req.method === "GET" && param === "allgamestat") {
    try {
      const gamestat = await db
        .collection("gameparser")
        .aggregate([
          {
            $unwind: {
              path: "$games",
            },
          },
          {
            $project: {
              _id: 0,
              name: "$games.title",
              slug: "$games.slug",
            },
          },
          {
            $group: {
              _id: 0,
              games: {
                $addToSet: {
                  value: "$slug",
                  label: "$name",
                },
              },
            },
          },
        ])
        .toArray();

      if (!gamestat.length) {
        return res.status(200).json([]);
      }

      res.status(200).json(gamestat[0].games);
    } catch (error) {
      console.error(`There was a problem retrieving entries with the query`);
      res.status(400).end();
    }
  }

  // GET ==================== Получаем данные пользователя офлайн =========================== GET //

  if (req.method === "GET" && param === "offlineuser") {
    try {
      const scratched = await db
        .collection("users")
        .find({ username: id })
        .toArray();

      res.status(200).json(scratched);
    } catch (error) {
      console.error(`There was a problem retrieving entries with the query`);
      res.status(400).end();
    }
  }

  // GET ==================== Получаем игры пользовтеля офлайн =========================== GET //

  if (req.method === "GET" && param === "offlinegames") {
    try {
      let today = new Date().toISOString().slice(0, 10);

      function compareNumbers(a, b) {
        return a.rank - b.rank;
      }

      const onedata = await db
        .collection("users")
        .find({ username: id })
        .toArray();

      const alldata = await db
        .collection("gameparser")
        .find({ date: today })
        .toArray();

      if (!alldata.length) {
        return res.status(200).json([[], onedata]);
      }

      alldata[0].games.sort(compareNumbers);

      alldata[0].games.map((game) => {
        for (let item of onedata[0].games) {
          if (item?.name === game?.title) {
            game.scratched = true;
            game.scratchedtime = new Date(item.date).toLocaleDateString();
          }
        }
      });

      res.status(200).json([alldata[0].games, onedata]);
    } catch (error) {
      console.error(`There was a problem retrieving entries with the query`);
      res.status(400).end();
    }
  }

  // GET ==================== Получаем все топ-листы (без игр, для сайдбара/админки) =========================== GET //

  if (req.method === "GET" && param === "alltoplists") {
    try {
      const lists = await db
        .collection("toplists")
        .find({})
        .project({ games: 0 })
        .sort({ createdAt: -1 })
        .toArray();

      res.status(200).json(lists);
    } catch (error) {
      console.error("Error fetching toplists");
      res.status(400).end();
    }
  }

  // GET ==================== Получаем один топ-лист по slug =========================== GET //

  if (req.method === "GET" && param === "toplist") {
    try {
      const list = await db
        .collection("toplists")
        .findOne({ slug: id });

      if (!list) {
        return res.status(404).json({ error: "List not found" });
      }

      // Add image URLs for games that have images
      if (list.games) {
        list.games.forEach((game) => {
          if (game.hasImage) {
            game.imageUrl = `/api/universalgetapi/${list._id}?route=gameimage&slug=${game.slug}`;
          }
          delete game.imageBase64; // Don't send base64 in list response
        });
      }

      // Если есть сессия — мержим scratch-статус
      if (session) {
        const userData = await db
          .collection("users")
          .findOne({ _id: ObjectId(session.user._id) });

        if (userData && userData.games) {
          list.games.forEach((game) => {
            for (let item of userData.games) {
              if (item?.name === game?.title) {
                game.scratched = true;
                game.scratchedtime = new Date(item.date).toLocaleDateString();
              }
            }
          });
        }
      }

      res.status(200).json(list);
    } catch (error) {
      console.error("Error fetching toplist");
      res.status(400).end();
    }
  }

  // GET ==================== Получаем дефолтный топ-лист =========================== GET //

  if (req.method === "GET" && param === "defaultlist") {
    try {
      const list = await db
        .collection("toplists")
        .findOne({ isDefault: true });

      if (!list) {
        return res.status(200).json({ name: "", games: [] });
      }

      // Add image URLs
      if (list.games) {
        list.games.forEach((game) => {
          if (game.hasImage) {
            game.imageUrl = `/api/universalgetapi/${list._id}?route=gameimage&slug=${game.slug}`;
          }
          delete game.imageBase64;
        });
      }

      // Если передан id пользователя — мержим scratch-статус
      if (session && id !== "default") {
        const userData = await db
          .collection("users")
          .findOne({ _id: ObjectId(id) });

        if (userData && userData.games) {
          list.games.forEach((game) => {
            for (let item of userData.games) {
              if (item?.name === game?.title) {
                game.scratched = true;
                game.scratchedtime = new Date(item.date).toLocaleDateString();
              }
            }
          });
        }
      }

      res.status(200).json(list);
    } catch (error) {
      console.error("Error fetching default list");
      res.status(400).end();
    }
  }

  // GET ==================== Получаем картинку элемента =========================== GET //

  if (req.method === "GET" && param === "gameimage") {
    try {
      // id = listId, query.slug = gameSlug
      const gameSlug = req.query.slug;
      const img = await db.collection("images").findOne({ listId: id, gameSlug });
      if (img && img.imageBase64) {
        // Return raw base64 image
        const base64Data = img.imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=3600");
        return res.status(200).send(buffer);
      }
      return res.status(404).end();
    } catch (error) {
      console.error("Error fetching game image");
      res.status(400).end();
    }
  }

  // GET ==================== Получаем настройки админа =========================== GET //

  if (req.method === "GET" && param === "adminsettings") {
    try {
      const settings = await db
        .collection("settings")
        .findOne({ type: "admin" });

      res.status(200).json(settings || { imageModel: "black-forest-labs/FLUX.1-schnell" });
    } catch (error) {
      console.error("Error fetching admin settings");
      res.status(400).end();
    }
  }

  // GET ==================== Получаем список моделей изображений с together.ai =========================== GET //

  if (req.method === "GET" && param === "togethermodels") {
    const fallbackModels = [
      { id: "black-forest-labs/FLUX.1-schnell", name: "FLUX.1 Schnell" },
      { id: "black-forest-labs/FLUX.1-dev", name: "FLUX.1 Dev" },
      { id: "black-forest-labs/FLUX.1-dev-lora", name: "FLUX.1 Dev LoRA" },
      { id: "black-forest-labs/FLUX.1-depth", name: "FLUX.1 Depth" },
      { id: "black-forest-labs/FLUX.1-canny", name: "FLUX.1 Canny" },
      { id: "black-forest-labs/FLUX.1-redux", name: "FLUX.1 Redux" },
      { id: "black-forest-labs/FLUX.1.1-pro", name: "FLUX 1.1 Pro" },
      { id: "black-forest-labs/FLUX.1-kontext-max", name: "FLUX.1 Kontext Max" },
      { id: "black-forest-labs/FLUX.1-kontext-pro", name: "FLUX.1 Kontext Pro" },
      { id: "black-forest-labs/FLUX.1-kontext-dev", name: "FLUX.1 Kontext Dev" },
      { id: "stabilityai/stable-diffusion-xl-base-1.0", name: "Stable Diffusion XL 1.0" },
    ];

    try {
      if (!process.env.TOGETHER_API_KEY) {
        return res.status(200).json(fallbackModels);
      }

      const response = await fetch("https://api.together.ai/v1/models", {
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        },
      });

      if (!response.ok) {
        return res.status(200).json(fallbackModels);
      }

      const data = await response.json();
      const allModels = Array.isArray(data) ? data : data.data || data.models || [];
      const imageModels = allModels
        .filter((m) => m.type === "image")
        .map((m) => ({ id: m.id, name: m.display_name || m.id }));

      res.status(200).json(imageModels.length > 0 ? imageModels : fallbackModels);
    } catch (error) {
      console.error("Error fetching together models");
      res.status(200).json(fallbackModels);
    }
  }

  res.end();
};
