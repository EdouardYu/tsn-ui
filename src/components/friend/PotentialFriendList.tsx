import { FunctionComponent, useState, useEffect } from "react";
import PotentialFriendCard from "./PotentialFriendCard";
import UserService from "@/services/UserService";
import "@/components/friends/FriendCard.css";

interface PotentialFriend {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  picture: string;
  role: string;
  mutualFriendsCount: number;
  commonLikedPostsCount: number;
  commonInterestsCount: number;
}

interface PotentialFriendsListProps {
  userId: number;
}

const PotentialFriendsList: FunctionComponent<PotentialFriendsListProps> = ({
  userId,
}) => {
  const [potentialFriends, setPotentialFriends] = useState<PotentialFriend[]>(
    []
  );
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const fetchPotentialFriends = async () => {
      try {
        const potentialFriendListData = await UserService.fetchPotentialFriends(
          userId,
          page
        );
        setPotentialFriends(
          potentialFriendListData.content.map((item: unknown[]) => ({
            id: item[0],
            firstname: item[1],
            lastname: item[2],
            username: item[3],
            picture: item[4],
            role: item[5],
            mutualFriendsCount: item[7],
            commonLikedPostsCount: item[8],
            commonInterestsCount: item[9],
          }))
        );
        setTotalPages(potentialFriendListData.totalPages);
      } catch (error) {
        console.error("Error fetching potential friends", error);
      }
    };

    fetchPotentialFriends();
  }, [userId, page]);

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  return (
    <div className="friends-list-container">
      <button
        className="pagination-button"
        onClick={handlePrevPage}
        disabled={page === 0}
      >
        &larr; Previous
      </button>
      <div className="friends-list">
        {potentialFriends.map((potentialFriend) => (
          <PotentialFriendCard
            key={potentialFriend.id}
            potentialFriend={potentialFriend}
          />
        ))}
      </div>
      <button
        className="pagination-button"
        onClick={handleNextPage}
        disabled={page === totalPages - 1}
      >
        Next &rarr;
      </button>
    </div>
  );
};

export default PotentialFriendsList;
