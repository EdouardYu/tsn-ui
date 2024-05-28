import { FunctionComponent, useState, useEffect } from "react";
import FriendCard from "./FriendCard";
import UserService from "@/services/UserService";
import "@/components/friends/FriendList.css";

interface Friend {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  picture: string;
  role: string;
}

interface FriendsListProps {
  userId: number;
}

const FriendsList: FunctionComponent<FriendsListProps> = ({ userId }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const friendListData = await UserService.fetchFriends(userId, page);
        setFriends(friendListData.content);
        setTotalPages(friendListData.totalPages);
      } catch (error) {
        console.error("Error fetching friends", error);
      }
    };

    fetchFriends();
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
        {friends.map((friend) => (
          <FriendCard key={friend.id} friend={friend} />
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

export default FriendsList;
