import { GetStaticProps } from "next";
import React from "react";
import { cfData, Problem } from "../utils/types";
import { convertTagsToId, tagMappingReverse } from "../utils/tags";
import styles from "../styles/Explore.module.scss";

interface exploreProps {
  problems: Problem[];
}

const explore: React.FC<exploreProps> = ({ problems }) => {
  return (
    <div className={styles.problemContainer}>
      {problems.map((problem) => {
        const k = `${problem.contestId}${problem.index}`;
        const link = `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`;
        return (
          <div key={k} className={styles.row}>
            <div className={styles.id}>
              {problem.contestId}
              {problem.index}
            </div>
            <a href={link} target="_blank" className={styles.link}>
              Link
            </a>
            <div className={styles.solvedCount}>{problem.solvedCount}</div>
            <div className={styles.rating}>
              {problem.rating || "Not Given Yet"}
            </div>
            <div className={styles.tags}>
              {problem.tags.map(
                (tag) =>
                  (problem.tags[0] === tag ? "" : ", ") + tagMappingReverse[tag]
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const getStaticProps: GetStaticProps<exploreProps> = async () => {
  const res = await fetch("https://codeforces.com/api/problemset.problems");
  const data: cfData = (await res.json()).result;

  const assortedData: Problem[] = [];
  for (let i = 0; i < data.problems.length; i++) {
    if (data.problems[i].type !== "PROGRAMMING") continue;
    assortedData.push({
      contestId: data.problems[i].contestId,
      index: data.problems[i].index,
      solvedCount: data.problemStatistics[i].solvedCount,
      rating: data.problems[i].rating || 0,
      tags: convertTagsToId(data.problems[i].tags),
    });
  }

  return {
    props: { problems: assortedData },
    revalidate: 3600,
  };
};

export default explore;
