import Image from "next/image"
import submitIcon from "/public/white_submit_icon.png";

export default function SubmitIcon() {
    return(
        <div>
            <Image src={submitIcon} alt="Search" width={25} height={25}></Image>
        </div>
    )
}