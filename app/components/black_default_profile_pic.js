import Image from "next/image";
import bdpp from "../../public/black_default_profile_picture.png";

export default function BlackProfileIcon() {
    return (
        <div>
            <Image src={bdpp} alt="profile-icon" width={75} height={75}></Image>
        </div>
    )
}