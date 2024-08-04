import Image from "next/image";
import wdpp from "../../public/white_default_profile_pic.png";

export default function WhiteProfileIcon() {
    return (
        <div>
            <Image src={wdpp} alt="profile-icon" height={75} width={75}></Image>
        </div>
    )
}