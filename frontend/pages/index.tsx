import React, { useState, useEffect } from "react";
import { Tag } from "../components/Tag";
import styles from "../styles/Home.module.scss";
import { maxRating, minRating } from "../utils/constants";
import { convertTagsToId, tagMapping, tagMappingReverse } from "../utils/tags";
import { cfData, Problem, Submission } from "../utils/types";

const trackedUsers: string[] = [];
const solveTracker: { [key: string]: string[] } = {};

const Home: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [handles, setHandles] = useState<string>("");
  const [tags, setTags] = useState<number[]>([]);
  const [leastRating, setLeastRating] = useState<number>(minRating);
  const [mostRating, setMostRating] = useState<number>(maxRating);
  const [minContestId, setMinContestId] = useState<number>(0);
  const [rolledProblem, setRolledProblem] = useState<Problem | null>(null);

  useEffect(() => {
    fetch("https://codeforces.com/api/problemset.problems").then(
      async (res) => {
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

        setProblems(assortedData);
        setLoaded(true);
      }
    );
  }, []);

  const getSolvedProblems = async (handle: string): Promise<boolean> => {
    if (trackedUsers.includes(handle)) return true;

    const res = await fetch(
      `https://codeforces.com/api/user.status?handle=${handle}`
    );
    if (res.status === 503) return false;
    const data = await res.json();
    if (data.status !== "OK") return false;

    data.result.map((submission: Submission) => {
      if (submission.verdict === "OK") {
        let key = submission.problem.contestId + submission.problem.index;

        if (!(solveTracker[key] ??= []).includes(handle))
          solveTracker[key].push(handle);
      }
    });
    trackedUsers.push(handle);

    return true;
  };

  const createTagList = (): JSX.Element[] => {
    const tagList: JSX.Element[] = [];
    Object.entries(tagMapping).map(([tag, id]) => {
      if (tags.includes(id)) return;
      tagList.push(
        <option value={tag} key={id}>
          {tag}
        </option>
      );
    });

    return tagList;
  };

  const createRatingPattern = (): string => {
    let pattern = "";
    for (let r = minRating; r <= maxRating; r += 100) {
      pattern += `${r}|`;
    }
    return pattern.slice(0, -1);
  };
  const createRatingDataList = (): JSX.Element[] => {
    const ratings = [];
    for (let r = minRating; r <= maxRating; r += 100) {
      ratings.push(
        <option value={r} key={r}>
          {r}
        </option>
      );
    }
    return ratings;
  };
  const fixRatingRange = (most: boolean): void => {
    let [l, r] = [leastRating, mostRating];
    if (most) [l, r] = [r, l];

    if (!l) l = r;
    else
      l = Math.min(maxRating, Math.max(minRating, Math.floor(l / 100) * 100));

    if (most === l < r) r = l;

    if (most) [l, r] = [r, l];
    setLeastRating(l), setMostRating(r);
  };

  const handleSubmit = async () => {
    if (!loaded) return;

    const checkContestId = (problem: Problem): boolean => {
      return problem.contestId >= minContestId;
    };

    const checkTags = (problem: Problem): boolean => {
      let good = true;
      tags.map((tag) => {
        good &&= problem.tags.includes(tag);
      });
      return good;
    };

    const handleList = handles
      .split(",")
      .map((handle) => handle.replaceAll(" ", ""))
      .filter((handle) => handle.length);
    handleList.map(async (handle) => {
      await getSolvedProblems(handle);
    });
    const checkHandles = (problem: Problem): boolean => {
      let good = true;
      handleList.map((handle) => {
        good &&=
          !solveTracker[problem.contestId + problem.index]?.includes(handle);
      });
      return good;
    };

    let [l, r] = [leastRating, mostRating];
    let ratingChoices: number[] = [];
    problems.map((problem) => {
      if (
        checkContestId(problem) &&
        checkTags(problem) &&
        checkHandles(problem) &&
        l <= problem.rating &&
        problem.rating <= r
      )
        if (!ratingChoices.includes(problem.rating))
          ratingChoices.push(problem.rating);
    });
    let ratingChoice =
      ratingChoices[Math.floor(Math.random() * ratingChoices.length)];
    const checkRating = (problem: Problem): boolean => {
      return problem.rating === ratingChoice;
    };

    const filteredProblems = problems.filter((problem) => {
      let good = true;
      good &&= checkContestId(problem);
      good &&= checkTags(problem);
      good &&= checkHandles(problem);
      good &&= checkRating(problem);
      return good;
    });
    if (filteredProblems.length === 0) {
      alert("Somehow no such problem exists!");
      return;
    }

    const rnd = Math.floor(Math.random() * filteredProblems.length);
    setRolledProblem(filteredProblems[rnd]);
  };

  return (
    <div className={styles.base}>
      <div className={styles.formContainer}>
        <div className={styles.form}>
          <div>
            <div>The Ultimate CF Problem Picker</div>
            <button
              onClick={() => {
                setHandles("");
                setTags([]);
                setLeastRating(minRating);
                setMostRating(maxRating);
                setMinContestId(0);
                setRolledProblem(null);
              }}
            >
              Reset
            </button>
          </div>
          <div className={styles.handles}>
            <div>Handles</div>
            <input
              value={handles}
              onChange={(e) => {
                setHandles(e.target.value);
              }}
              title="Separate handles with commas"
            ></input>
          </div>
          <div>
            <div>Tags</div>
            <div>
              <select
                defaultValue={""}
                onChange={(e) => {
                  setTags([...tags, tagMapping[e.target.value]]);
                }}
                disabled={tags.length === 5}
              >
                <option value="" hidden>
                  {tags.length >= 5 ? "Limit of 5 tags reached" : "Choose"}
                </option>
                {createTagList()}
              </select>
            </div>
          </div>
          <div className={styles.rating}>
            <div>Rating</div>
            <div>
              <input
                list="ratings"
                value={leastRating || ""}
                onChange={(e) => {
                  setLeastRating(parseInt(e.target.value));
                }}
                onBlur={() => fixRatingRange(false)}
                pattern={createRatingPattern()}
              ></input>
              <span>---{">"}</span>
              <input
                list="ratings"
                value={mostRating || ""}
                onChange={(e) => {
                  setMostRating(parseInt(e.target.value));
                }}
                onBlur={() => fixRatingRange(true)}
                pattern={createRatingPattern()}
              ></input>
              <datalist id="ratings">{createRatingDataList()}</datalist>
            </div>
          </div>
          <div className={styles.mnContestId}>
            <div>Minimum Contest ID</div>
            <input
              value={minContestId || ""}
              onChange={(e) => {
                setMinContestId(parseInt(e.target.value) || 0);
              }}
            ></input>
          </div>
          <button disabled={!loaded} onClick={handleSubmit}>
            Submit
          </button>
        </div>
        {!!tags.length && (
          <div className={styles.tagContainer}>
            <div>Selected tags</div>
            <div className={styles.chosenTags}>
              {tags.map((id) => {
                return (
                  <Tag
                    value={tagMappingReverse[id]}
                    key={id}
                    removeTag={() => {
                      setTags(tags.filter((tag) => tag !== id));
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
      {rolledProblem && (
        <div className={styles.problemCard}>
          <a
            target={"_blank"}
            href={`https://www.codeforces.com/contest/${rolledProblem.contestId}/problem/${rolledProblem.index}`}
          >
            {rolledProblem.contestId + rolledProblem.index}
          </a>
        </div>
      )}
    </div>
  );
};

export default Home;
