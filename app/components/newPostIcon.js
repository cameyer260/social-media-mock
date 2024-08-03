import Image from "next/image"
import npi from "/public/new_post_icon.png";

export default function NewPostIcon() {
    return(
        <div>
            <Image src={npi} alt="Click here." width={75} height={75}></Image>
        </div>
    )
}