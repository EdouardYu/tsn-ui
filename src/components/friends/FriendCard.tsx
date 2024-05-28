import { FunctionComponent } from "react";
import { useNavigate } from "react-router-dom";
import CertifiedBadge from "@/components/icons/CertifiedBadge";
import "@/components/friends/FriendCard.css";

interface FriendCardProps {
  friend: {
    id: number;
    firstname: string;
    lastname: string;
    username: string;
    picture: string;
    role: string;
  };
}

const FriendCard: FunctionComponent<FriendCardProps> = ({ friend }) => {
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
    navigate(`/profile/${friend.id}`);
  };

  return (
    <div className="friend-card" onClick={handleCardClick}>
      <img
        src={friend.picture}
        alt={friend.username}
        className="friend-card-image"
      />
      <div className="friend-card-info">
        <div className="friend-card-name">
          {friend.firstname} {friend.lastname}
        </div>
        <div className="friend-card-username">
          {friend.username}
          {friend.role !== "USER" && (
            <CertifiedBadge
              color={getBadgeColor(friend.role)}
              className="certified-badge"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendCard;
