import React, { useEffect, useState, useCallback, useMemo } from "react";
import "./githomepage.css";
import axios from "axios";
import LoadingSpinner from "./Loading";
import gitLogo from "../../ic.png";

const GitHomepage = () => {
  const [gitData, setGitData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [starCountRepo, setStarCountRepo] = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const options = {
    headers: {
      Authorization: `Bearer ${process.env.MY_GITHUBSEARCH_APP_TOKEN}`,
    },
  };

  //Function to get data
  const getData = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://api.github.com/repositories",
        options
      );
      setGitData(response.data);
    } catch (error) {
      setGitData(null);
    }
  }, []);

  // Function to get data from api based on reponame
  const getStarRepo = useCallback(async () => {
    setIsLoading(true);
    const starrep = gitData.map((str) => str.full_name);
    const starCountUrls = starrep.map(
      (starOwnerName) => `https://api.github.com/repos/${starOwnerName}`
    );
    try {
      const starCountDataArray = await axios.all(
        starCountUrls.map((url) => axios.get(url, options))
      );
      setStarCountRepo(
        starCountDataArray.map((countdata) => countdata.data.stargazers_count)
      );
    } catch (error) {
      console.log("error occurred");
    }
    setIsLoading(false);
  }, [gitData]);

  const aggregatedData = useMemo(() => {
    return gitData.map((item, index) => ({
      ...item,
      starCount: starCountRepo[index],
    }));
  }, [gitData, starCountRepo]);

  const sortedStarCount = useMemo(() => {
    return aggregatedData.sort((a, b) => {
      return sortOrder === "asc"
        ? a.starCount - b.starCount
        : b.starCount - a.starCount;
    });
  }, [sortOrder]);

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    getStarRepo();
  }, [gitData]);

  return (
    <>
      <div className="headerGit">
        <img src={gitLogo} alt="github logo" />
        <h2>Github Search App</h2>
      </div>

      <div className="searchandSort">
        <div className="searchbox">
          <input
            type="text"
            placeholder="Search Repo"
            onChange={(e) => setSearchVal(e.target.value)}
            value={searchVal}
          />
        </div>
        <div className="sortCard">
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            Sort: ⭐ {sortOrder === "asc" ? "⬆" : "⬇"}{" "}
          </button>
        </div>
      </div>
      {aggregatedData
        .filter((value) => {
          if (searchVal === "") {
            return value;
          } else if (
            value.full_name.toLowerCase().includes(searchVal.toLowerCase())
          ) {
            return value;
          }
        })
        .map((item, index) => (
          <div className="cards-container" key={item.id}>
            <div className="cards " key={item.id}>
              <div className="cards__img">
                <img alt="" src={item.owner.avatar_url} />
              </div>
              <div className="profile__img">
                <img alt="" src={item.owner.avatar_url} />
              </div>
              <div className="content">
                <div className="card__title">
                  <b>Name:</b> {item.name}
                </div>
                <div className="card__title">
                  <b>Repository:</b> {item.full_name}
                </div>
                <div className="card-star">
                  <span>⭐ </span> :{" "}
                  {isLoading ? <LoadingSpinner /> : item.starCount}{" "}
                </div>

                <div className="card__description">
                  <b>Description:</b> {item.description}
                </div>
              </div>
            </div>
          </div>
        ))}
    </>
  );
};

export default GitHomepage;
