// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract HotelRoomBooking {
    struct Room {
        uint256 roomNo;
        address bookedBy;
        uint256 price;
        bool isBooked;
    }

    address payable public owner;
    uint256 totalRevenue;
    Room[] public rooms;

    function getRooms() external view returns (Room[] memory) {
        return rooms;
    }

    constructor(uint256 _noOfRooms) {
        owner = payable(msg.sender);

        // Construct the Available Rooms
        for (uint256 index = 0; index < _noOfRooms; index++) {
            rooms.push(Room(index + 1, address(0x0), 2e17, false));
        }
    }

    // FUNCTION - To book the hotel rooms
    function bookRoom(uint256 _roomNumber)
        external
        payable
        roomIsNotOccupied(_roomNumber)
    {
        require(
            msg.value >= rooms[_roomNumber - 1].price,
            "The quoted ether value is too small to book this Room"
        );
        require(
            _roomNumber > 0 && _roomNumber <= rooms.length,
            "The Room number is not valid"
        );

        // Payment
        (bool moneySentSuccessfully, bytes memory data) = owner.call{
            value: msg.value
        }("");

        require(
            moneySentSuccessfully,
            "There is an issue while transferring the Price"
        );

        rooms[_roomNumber - 1].bookedBy = msg.sender;
        rooms[_roomNumber - 1].isBooked = true;

        totalRevenue += msg.value;

        // Event emitter
        emit roomBooked(msg.sender, msg.value, _roomNumber, data);
    }

    // FUNCTION - To provide the total revenue for this Owner
    function getTotalIncome() external view onlyBy(owner) returns (uint256) {
        return totalRevenue;
    }

    // FUNCTION - Add new Room to the hotel
    function addRoom(uint256 _price) external {
        require(_price > 0);
        rooms.push(Room(rooms.length + 1, address(0x0), _price, false));
    }

    // VALIDATION - Validate whether the room is occupied or not
    modifier roomIsNotOccupied(uint256 _roomNumber) {
        require(
            rooms[_roomNumber - 1].isBooked == false,
            "The Room is currently occupied"
        );
        _;
    }

    // VALIDATION - Validate whether the incoming address is the Owner of this Contract
    modifier onlyBy(address _account) {
        require(msg.sender == _account);
        _;
    }

    event roomBooked(
        address _bookedBy,
        uint256 _price,
        uint256 _roomNumber,
        bytes data
    );
}
