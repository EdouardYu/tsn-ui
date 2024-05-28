import { FunctionComponent, useState, useEffect } from "react";
import FriendsList from "@/components/friends/FriendList";
import PotentialFriendsList from "@/components/friends/PotentialFriendList";
import "@/components/friends/FriendCard.css";
import Loader from "@/components/loader/Loader";

interface JwtPayload {
  id: string;
  picture: string;
}

const Friends: FunctionComponent = () => {
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const payload: JwtPayload = JSON.parse(atob(token.split(".")[1]));
      setUserId(parseInt(payload.id));
    }
  }, []);

  if (userId === null) {
    return <Loader />;
  }

  return (
    <div className="friends-page">
      <h1>Friends</h1>
      <FriendsList userId={userId} />
      <h2>Potential Friends</h2>
      <PotentialFriendsList userId={userId} />
    </div>
  );
};

export default Friends;
