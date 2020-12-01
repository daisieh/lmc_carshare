import * as React from "react";
import BookCar from "./BookCar";
import RequestList from "./RequestList";
import {SignOut} from "./transpositFunctions";
import {Pages, User} from "./types";
import {connect} from "react-redux";
import Calendar from "./Calendar";
import AllCars from "./AllCars";
import MyCar from "./MyCar";
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
                    main =
                        <main className="container-fluid">
                            <BookCar/>
                        </main>
                } else if (this.state.mode === "/requests") {
                    main =
                        <main className="container-fluid">
                            <RequestList/>
                        </main>
                } else if (this.state.mode === "/my_car") {
                    main =
                        <main className="container-fluid">
                            <MyCar/>
                        </main>
                } else if (this.state.mode === "/calendar") {
                    main =
                        <main className="container-fluid">
                            <Calendar/>
                        </main>
                } else if (this.state.mode === "/cars") {
                    main =
                        <main className="container-fluid">
                            <AllCars/>
                        </main>
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
                {main}
            </>
        );
    };
}

const mapStateToProps = (state) => {
    return {user: state.user.user};
}

export default connect(mapStateToProps)(Navigation)
