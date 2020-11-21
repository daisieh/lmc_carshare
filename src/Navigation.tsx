import {CarshareBooker} from "./CarshareBooker"
import * as React from "react";
import {Loader, Nav, Navbar} from "rsuite";
import SearchAvailabilityForm from "./SearchAvailabilityForm";
import RequestList from "./RequestList";
import {SignOut} from "./fakeTranspositFunctions";
import {Pages, User} from "./types";
import {connect} from "react-redux";

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
        console.log(`mode is ${this.state.mode}`);
        if (this.props.user) {
                if (this.state.mode === "/bookings") {
                    main =
                        <main className="container main">
                            <SearchAvailabilityForm user={this.props.user}/>
                            {/*<AvailableCars booker={this.state.booker}/>*/}
                            {/*<BookingStatus booker={this.state.booker}/>*/}
                        </main>
                } else if (this.state.mode === "/requests") {
                    main =
                        <main className="container main">
                            <RequestList/>
                        </main>
                // } else if (this.state.mode === "/my_car") {
                //     main =
                //         <main className="container main">
                //             car
                //         </main>
                // } else if (this.state.mode === "/calendar") {
                //     main =
                //         <main className="container main">
                //             <CarCalendar booker={this.state.booker}/>
                //         </main>
                // } else if (this.state.mode === "/cars") {
                //     main =
                //         <main className="container main">
                //             cars
                //         </main>
                }
        }
        let navitems = Object.keys(Pages).map(x => {
            return <Nav.Item key={x} href={x} active={this.state.mode === x}>{Pages[x]}</Nav.Item>
        });

        return (
            <>
                <Navbar className="navbar">
                    <Navbar.Header className="navbar-welcome">
                        Welcome, {this.props.user.name}
                    </Navbar.Header>
                    <Navbar.Body>
                        <Nav appearance="tabs">
                            {navitems}
                        </Nav>
                        <Nav pullRight>
                            <Nav.Item onClick={SignOut}>Sign Out</Nav.Item>
                        </Nav>
                    </Navbar.Body>
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
