import { FunctionComponent } from "react";
import { useNavigate } from "react-router-dom";
import CertifiedBadge from "@/components/icons/CertifiedBadge";
import "@/components/friends/FriendCard.css";

interface PotentialFriendCardProps {
  potentialFriend: {
    id: number;
    firstname: string;
    lastname: string;
    username: string;
    picture: string;
    role: string;
    mutualFriendsCount: number;
    commonLikedPostsCount: number;
    commonInterestsCount: number;
  };
}

const PotentialFriendCard: FunctionComponent<PotentialFriendCardProps> = ({
  potentialFriend,
}) => {
  const navigate = useNavigate();

  const getBadgeColor = (role: string) => {
    switch (role) {
      case "ADMINISTRATOR":
        return "#ffd700";
      case "CERTIFIED_USER":
        return "#1d9bf0";
      default:
        return "transparent";
    }
  };

  const handleCardClick = () => {
    navigate(`/profile/${potentialFriend.id}`);
  };

  return (
    <div className="friend-card" onClick={handleCardClick}>
      <img
        src={potentialFriend.picture}
        alt={potentialFriend.username}
        className="friend-card-image"
      />
      <div className="friend-card-info">
        <div className="friend-card-name">
          {potentialFriend.firstname} {potentialFriend.lastname}
        </div>
        <div className="friend-card-username">
          {potentialFriend.username}
          {potentialFriend.role !== "USER" && (
            <CertifiedBadge
              color={getBadgeColor(potentialFriend.role)}
              className="certified-badge"
            />
          )}
        </div>
        <div className="friend-card-details">
          {potentialFriend.mutualFriendsCount} mutual friends
        </div>
        <div className="friend-card-details">
          {potentialFriend.commonLikedPostsCount} common liked posts
        </div>
        <div className="friend-card-details">
          {potentialFriend.commonInterestsCount} common interests
        </div>
      </div>
    </div>
  );
};

export default PotentialFriendCard;
