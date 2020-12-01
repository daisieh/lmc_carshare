import * as React from "react";
import BookCar from "./BookCar";
import Requests from "./Requests";
import Calendar from "./Calendar";
import AllCars from "./AllCars";
import MyCar from "./MyCar";
import {SignOut} from "./transpositFunctions";
import {Pages, User} from "./types";
import {connect} from "react-redux";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Spinner from "react-bootstrap/Spinner";

interface NavigationProps {
    user: User;
    mode: string;
}

interface NavigationState {
    mode: string;
}

export class Navigation extends React.Component<NavigationProps, NavigationState> {
    constructor(props) {
        super(props);
        this.state = {
            mode: this.props.mode
        };
    };

    render() {
        let main = <Spinner className="main-spinner" animation="border" role="status"/>
        if (this.props.user) {
                if (this.state.mode === "/bookings") {
                    main = <BookCar/>
                } else if (this.state.mode === "/requests") {
                    main = <Requests/>
                } else if (this.state.mode === "/my_car") {
                    main = <MyCar/>
                } else if (this.state.mode === "/calendar") {
                    main = <Calendar/>
                } else if (this.state.mode === "/cars") {
                    main = <AllCars/>
                }
        }
        let navitems = Object.keys(Pages).map(x => {
            return <Nav.Link key={x} href={x}>{Pages[x]}</Nav.Link>
        });

        return (
            <>
                <Navbar>
                    <Nav className="tabs" activeKey={this.props.mode}>
                        {navitems}
                        <Nav.Link key="signout" onClick={SignOut}>Sign out</Nav.Link>
                    </Nav>
                </Navbar>
                <main className="container-fluid">
                    {main}
                </main>
            </>
        );
    };
}

const mapStateToProps = (state) => {
    return {user: state.user.user};
}

export default connect(mapStateToProps)(Navigation)
