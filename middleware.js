export function middleware(request) {
    // mutler stuff
    const multer = require("multer");
    // save file in ram
    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage });
    upload.single('image'); // tells multer we are expect one image file called image, it will throw an error if this is not the case
}

export const config = {
    matcher: "/api/user/profilePicture",
}
