import * as React from "react";
import {render} from "react-dom";
import {BookingStatus} from "./carbooker";
jest.mock('transposit');
const list_cars = [
    {
        "AL675T": {
            "Timestamp": "20/01/2020 16:21:11",
            "Make": "Toyota",
            "Model": "Prius",
            "Color": "Blue",
            "Features": [
                "pet friendly",
                "child friendly",
                "eco friendly"
            ],
            "Licence": "AL675T",
            "Email": "lmc.blue.prius.2009@gmail.com",
            "AlwaysAvailable": true,
            "Confirm": false,
            "Description": "Blue Toyota Prius AL675T"
        },
        "NLEAF": {
            "Timestamp": "20/01/2020 16:20:52",
            "Make": "Nissan",
            "Model": "Leaf",
            "Color": "Orange",
            "Features": [
                "child friendly",
                "eco friendly"
            ],
            "Licence": "NLEAF",
            "Email": "lmc.orange.leaf.2017@gmail.com",
            "AlwaysAvailable": true,
            "Confirm": true,
            "Description": "Orange Nissan Leaf NLEAF"
        },
        "ELEMENT": {
            "Timestamp": "20/01/2020 16:24:21",
            "Make": "Honda",
            "Model": "Element",
            "Color": "Orange",
            "Features": [
                "pet friendly",
                "cargo",
                "camping"
            ],
            "Licence": "ELEMENT",
            "Email": "mutantdaisies@gmail.com",
            "AlwaysAvailable": false,
            "Confirm": true,
            "Description": "Orange Honda Element ELEMENT"
        }
    }
];

const list_features = [
    "pet friendly",
    "child friendly",
    "eco friendly",
    "cargo",
    "camping",
    "clean"
];

const user = {name: 'Test Test', email: 'test@test.com'};
it('renders without crashing', () => {
    const div = document.createElement('div');
    render(<BookingStatus resetBooking={() => {}} booking={null}/>, div);
});
test('Link changes the class when hovered', () => {
    let cars = Object.keys(list_cars[0]).map(key => list_cars[0][key]);
    // let component = renderer.create(<CarshareBooker user={user} startTime={""} endTime={""} cars={cars} chosenCar={""} availableFeatures={list_features}/>);
    // let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
    //
    // // manually trigger the callback
    // tree.props.onMouseEnter();
    // // re-rendering
    // tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
    //
    // // manually trigger the callback
    // tree.props.onMouseLeave();
    // // re-rendering
    // tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
});

test('adds 1 + 2 to equal 3', () => {
    // let tester = <Navigation></Navigation>
    expect(1+2).toBe(3);
});