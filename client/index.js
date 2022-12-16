import Web3 from 'web3';
import 'bootstrap/dist/css/bootstrap.css';
import roomContractConfiguration from '../build/contracts/HotelRoomBooking.json';
import roomImage from './images/room.png';

// Helper Method to create DOM element
const createDivFromString = async (string) => {
    const div = document.createElement('div');
    div.innerHTML = string.trim();
    return div.firstChild;
};

// Constants
const ROOMS_COUNT = 10;

// Initializing the Web3
const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:7545');

// Getting the constract instance
const CONTRACT_ADDRESS = roomContractConfiguration.networks['5777'].address;
const CONTRACT_ABI = roomContractConfiguration.abi;
const roomConstract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

// account details
let loggedInAccountAddress;
const accountEl = document.getElementById('account');
const roomsEl = document.getElementById('rooms');

// Book Room method
const bookTheRoom = async (room) => {
    await roomConstract.methods.bookRoom(room.roomNo).send({
        from: loggedInAccountAddress,
        value: room.price,
    });
    await refreshRooms();
}

// Add the Room
const addTheRoom = async (_price) => {
    alert(_price);
    //await roomConstract.methods.addRoom(_price).call();
    await refreshRooms();
}

// Refresh Rooms method
const refreshRooms = async () => {
    roomsEl.innerHTML = '';

    const rooms = await roomConstract.methods.getRooms().call();

    for (let index = 0; index < rooms.length; index++) {
        const room = rooms[index];

        const roomEl = await createDivFromString(`
            <div class="room card" style="width: 18rem;">
                <img class="card-img-top" src="${roomImage}" alt="room image here :)">
                <div class="card-body">
                    <h5 class="card-title">Room No ${room.roomNo}</h5>
                    <p class="card-text">
                        Price : ${room.price / 1e18} 
                        <i class='fab fa-ethereum'></i>
                    </p>
                    ${room.isBooked ?
                '<button type="button" class="btn btn-secondary" style="cursor: not-allowed; pointer-events: none;">Booked</button>'
                :
                '<button href="#" class="btn btn-primary">Book now</button>'
            } 
                    
                </div>
            </div>
            `);

        if (!room.isBooked) {
            const button = roomEl.querySelector('button');
            button.onclick = bookTheRoom.bind(null, room);
        } else {
            roomEl.disabled = true;
        }
        roomsEl.appendChild(roomEl);
    }
};

// MAIN method
const main = async () => {

    // Showing accounts in the UI
    const accounts = await web3.eth.requestAccounts();
    loggedInAccountAddress = accounts[0];
    accountEl.innerText = loggedInAccountAddress;
    const ownerAddress = await roomConstract.methods.owner().call();

    if (loggedInAccountAddress === ownerAddress) {

        if (confirm("Looks like you are the owner. Please sign in to view Owner features")) {
            var message = "vels-admin-account";
            var signature = await web3.eth.personal.sign(message, loggedInAccountAddress);
            await web3.eth.personal.ecRecover(message, signature)
                .then((address) => {
                    if (address.toUpperCase() === loggedInAccountAddress.toUpperCase()) {

                        // Adding Total Income to the UI
                        roomConstract.methods.getTotalIncome().call()
                            .then((totalIncome) => {
                                createDivFromString(`
                                <div class="alert alert-primary" role="alert">
                                Total Income: <b> ${totalIncome / 1e18} </b>
                                <i class='fab fa-ethereum' style='font-size:15px'></i>
                              </div>
            `)
                                    .then((result) => {
                                        document.getElementById("totalIncome").appendChild(result);
                                    });
                            });

                            let roomPrice;

                            // Adding Add Book button to the UI
                            createDivFromString(`
                            <div class="input-group mb-3">
                                <input 
                                    type="number" 
                                    id="roomPriceInput"
                                    class="form-control" 
                                    placeholder="Room Price in ETH" 
                                    aria-label="Room Price in ETH" 
                                    aria-describedby="basic-addon2"
                                    value="${roomPrice}">
                                <div class="input-group-append">
                                    <button id="addroom" class="btn btn-outline-secondary" type="button">Add Room</button>
                                </div>
                            </div>
                            `)
                            .then((createdBtnHtml) => {
                                document.getElementById("totalIncome").appendChild(createdBtnHtml);
                                const addButton = document.getElementById("addroom");
                                addButton.onclick = addTheRoom.bind(null, roomPrice);
                            });

                    }
                });
        }
    }

    // Refresh the rooms on loading the main
    await refreshRooms();
};

main();