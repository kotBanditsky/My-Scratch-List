import { React, useState } from "react";
import { universalPost } from "../api";
import { useSession } from "next-auth/react";
import { useSWRConfig } from "swr";
import { useAtom } from "jotai";
import { isOpeningAll } from "../atoms/atoms";
import { useRouter } from "next/router";
import { ru } from "../messages/ru";
import { en } from "../messages/en";

export default function ButtonClear(data) {
  const [isClicked, setIsClicked] = useState(true);
  const [openingall, setOpeningAll] = useAtom(isOpeningAll);
  const { data: session } = useSession();
  const { cache } = useSWRConfig();
  const router = useRouter();
  const t = router.locale === "en" ? en : ru;

  function eraseHandler() {
    universalPost(
      session.user._id,
      JSON.stringify({
        name: data.title,
        methodic: "uniapidelscratch",
      }),
      "uniapidelscratch",
      t.del_item
    ).then((result) => {
      setOpeningAll(result);
    });

    setIsClicked(false);
    cache.clear();
  }

  return (
    <>
      <button
        onClick={eraseHandler}
        className="flex items-center p-1 text-text-muted transition-all hover:text-danger rounded"
      >
        {isClicked ? (
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            ></path>
          </svg>
        ) : (
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        )}
      </button>
    </>
  );
}
