import * as React from "react";
import {Loader} from "rsuite";
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
        let main =
            <main className="container main">
                <Loader size="lg" center content="Loading" vertical/>
            </main>
        if (this.props.user) {
                if (this.state.mode === "/bookings") {
                    main =
                        <main className="container main">
                            <BookCar/>
                        </main>
                } else if (this.state.mode === "/requests") {
                    main =
                        <main className="container main">
                            <RequestList/>
                        </main>
                } else if (this.state.mode === "/my_car") {
                    main =
                        <main className="container main">
                            <MyCar/>
                        </main>
                } else if (this.state.mode === "/calendar") {
                    main =
                        <main className="container main">
                            <Calendar/>
                        </main>
                } else if (this.state.mode === "/cars") {
                    main =
                        <main className="container main">
                            <AllCars/>
                        </main>
                }
        }
        let navitems = Object.keys(Pages).map(x => {
            // return <Nav.Item key={x} href={x} active={this.state.mode === x}>{Pages[x]}</Nav.Item>
            return <Nav.Link href={x}>{Pages[x]}</Nav.Link>
        });

        return (
            <>
                <Navbar>
                        <Nav className="tabs">
                            {navitems}
                        </Nav>
                        <Nav>
                            <Nav.Link className="row justify-content-end" onClick={SignOut}>Sign out {this.props.user.name}</Nav.Link>
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
