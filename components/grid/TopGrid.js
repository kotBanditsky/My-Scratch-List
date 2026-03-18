import React from "react";
import TopCard from "./TopCard";

const TopGrid = ({ data }) => {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {data.map((data, i) => (
        <TopCard
          clock={i + 1}
          key={i}
          title={data.title}
          image={data.image}
          imageBase64={data.imageBase64}
          imageUrl={data.imageUrl}
          description={data.description}
          rating={data.rating}
          rank={data.rank}
          slug={data.slug}
          id={data._id}
          scratch={data.scratched}
          time={data.scratchedtime}
        />
      ))}
    </div>
  );
};

export default TopGrid;
