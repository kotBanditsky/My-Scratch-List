import { React, useState } from "react";
import SquereCard from "./ScratchCard";
import { useSession } from "next-auth/react";
import ButtonClear from "./Button";
import { ru } from "../../components/messages/ru";
import { en } from "../../components/messages/en";
import { useRouter } from "next/router";

const TopCard = ({
  title,
  description,
  rating,
  scratch,
  time,
  slug,
  clock,
  imageBase64,
  image,
  imageUrl,
}) => {
  const router = useRouter();
  const t = router.locale === "en" ? en : ru;
  const { data: session } = useSession();
  const [data, setData] = useState();
  const [label, setLabel] = useState(`${t.cardstatus} ${time}`);
  const fallbackSrc = "/qube.png";
  const imgSrc = imageUrl || imageBase64 || image || fallbackSrc;

  let date = new Date();
  let day = `0${date.getDate()}`.slice(-2);
  let month = `0${date.getMonth() + 1}`.slice(-2);
  let year = date.getFullYear();

  const childToParent = (childdata) => {
    setData(childdata);
    setLabel(`${t.cardstatus} ${day}/${month}/${year}`);
  };

  return (
    <div className="glass-card overflow-hidden flex flex-col h-full">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          className="w-full h-full object-cover"
          src={imgSrc}
          onError={(e) => { e.target.onError = null; e.target.src = fallbackSrc; }}
          alt={title}
        />
        {!scratch && <SquereCard title={title} childToParent={childToParent} />}
        <div className="absolute bottom-2 right-2 glass text-text-primary text-xs font-semibold px-2 py-1 rounded-lg">
          {rating}
        </div>
      </div>
      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h4 className="text-sm font-semibold text-text-primary leading-snug mb-1">
          <span className="text-accent">{clock}.</span> {title}
        </h4>
        <p className="text-text-muted text-xs line-clamp-2">{description}</p>
        {scratch && (
          <div className="flex justify-between items-center mt-auto pt-3">
            <p className="text-text-muted text-[10px]">{label}</p>
            {session && <ButtonClear title={title} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopCard;
