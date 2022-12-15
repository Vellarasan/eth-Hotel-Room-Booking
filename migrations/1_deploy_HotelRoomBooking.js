const HotelRoomBooking = artifacts.require("HotelRoomBooking.sol");
module.exports = function (deployer) {
      deployer.deploy(HotelRoomBooking, 10);
};