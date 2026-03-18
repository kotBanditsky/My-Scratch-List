const env = process.env.NODE_ENV;
import useSWR from "swr";
import axios from "axios";

let baseUrl = "";
if (typeof window !== "undefined") {
  baseUrl = window.location.origin;
} else if (env == "production") {
  baseUrl = process.env.NEXTAUTH_URL || "";
}

// GET ================================== Получаем данные из базы по SWR ===================================== GET //

const fetcher = (url, route) =>
  axios
    .get(url, {
      params: {
        route: route,
      },
    })
    .then((res) => res.data);

export function useGetMongo(id, route) {
  const { data, error, mutate } = useSWR(
    [`${baseUrl}/api/universalgetapi/${id}`, route],
    fetcher,
    {
      refreshInterval: 1000,
    }
  );

  return {
    data: data,
    isLoading: !error && !data,
    isError: error,
    mutate: mutate,
  };
}

//  ================================== UNIVERSAL POST  =====================================  //

export async function universalPost(id, data, route, operation) {
  try {
    const entriesData = await fetch(`${baseUrl}/api/universalpostapi/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.stat == "okay") {
          return {
            opening: true,
            severity: "success",
            alerttext: operation,
          };
        } else {
          return {
            opening: true,
            severity: "error",
            alerttext: "Произошла ошибка!",
          };
        }
      });
    return entriesData;
  } catch (error) {
    console.error(`There was a problem with UNIPOST`);
    console.error(error);
  }
}

