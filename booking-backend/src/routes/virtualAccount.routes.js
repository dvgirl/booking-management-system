const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const {
  createVirtualAccount,
  assignAdmin,
  listVirtualAccounts,
  getUsers
} = require("../controllers/virtualAccount.controller");

router.post(
  "/",
  auth,
  role("SUPER_ADMIN" , "ADMIN"),
  createVirtualAccount
);

router.post(
  "/assign-admin",
  auth,
  role("SUPER_ADMIN" , "ADMIN"),
  assignAdmin
);

router.get(
  "/users",
  auth,
  role("SUPER_ADMIN" , "ADMIN"),
  getUsers
);

router.get(
  "/",
  auth,
  role("SUPER_ADMIN" , "ADMIN"),
  listVirtualAccounts
);

module.exports = router;
