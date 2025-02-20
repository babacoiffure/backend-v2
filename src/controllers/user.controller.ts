import User, { generateUniqueUID } from "../database/models/User";
import { handleAsyncHttp } from "../middleware/controller";
import { getUserById } from "../service/user.service";
import queryHelper from "../utils/query-helper";

export const handleUpdateUserInfo = handleAsyncHttp(async (req, res) => {
    let updatedInfo = {
        ...req.body,
    };
    if (updatedInfo.email) {
        delete updatedInfo["email"];
    }
    if (req.body.name) {
        updatedInfo.uid = await generateUniqueUID(req.body.name);
    }

    const user = await User.findByIdAndUpdate(req.params.userId, updatedInfo, {
        new: true,
        runValidators: true,
    });

    res.success("Updated user info", user, 200);
});

export const handleGetUserList = handleAsyncHttp(async (req, res) => {
    const list = await queryHelper(User, req.query);
    res.success("User list", list);
});

export const handleHandleGetUserById = handleAsyncHttp(async (req, res) => {
    res.success("User", await getUserById(req.params.id), 200);
});
