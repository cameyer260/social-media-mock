import Image from "next/image"
import nmi from "/public/white_new_message_icon.png";

export default function NewMessageIcon() {
    return(
        <div>
            <Image src={nmi} alt="Click here." width={75} height={75}></Image>
        </div>
    )
}