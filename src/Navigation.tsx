import {CarshareBooker, User} from "./dataModel";
import * as React from "react";
import {Loader, Nav, Navbar} from "rsuite";
import {AvailableCars, BookingStatus, SearchAvailabilityForm} from "./carbooker";
import {RequestList} from "./requests";
import {CarCalendar} from "./carCalendar";
import {SignOut} from "./transpositFunctions";

export const Pages = {
    "/bookings": "Book Car",
    "/requests": "Requests",
    "/my_car": "My Car",
    "/cars": "Available Cars",
    "/calendar": "Calendar"
}

interface NavigationProps {
    user: User;
    isValid: number;
    mode: string;
}

interface NavigationState {
    mode: string;
    booker: CarshareBooker;
}

export class Navigation extends React.Component<NavigationProps, NavigationState> {
    constructor(props) {
        super(props);
        this.state = {
            mode: this.props.mode,
            booker: new CarshareBooker({user: this.props.user})
        };
    };

    render() {
        let main =
            <main className="container main">
                <Loader size="lg" center content="Loading" vertical/>
            </main>
        console.log(`mode is ${this.state.mode}`);
        if (this.props.user) {
            if (this.props.isValid === -1) {
                main = <main className="container main">
                    <div>
                        {this.props.user.name}, your address {this.props.user.email} is
                        not registered as a carshare member.
                        Please contact the LMC Carshare team to register your account.
                    </div>
                </main>
            } else if (this.props.isValid === 1) {
                if (this.state.mode === "/bookings") {
                    main =
                        <main className="container main">
                            <SearchAvailabilityForm booker={this.state.booker}/>
                            <AvailableCars booker={this.state.booker}/>
                            <BookingStatus booker={this.state.booker}/>
                        </main>
                } else if (this.state.mode === "/requests") {
                    main =
                        <main className="container main">
                            <RequestList booker={this.state.booker}/>
                        </main>
                } else if (this.state.mode === "/my_car") {
                    main =
                        <main className="container main">
                            car
                        </main>
                } else if (this.state.mode === "/calendar") {
                    main =
                        <main className="container main">
                            <CarCalendar booker={this.state.booker}/>
                        </main>
                } else if (this.state.mode === "/cars") {
                    main =
                        <main className="container main">
                            cars
                        </main>
                }
            }
        }
        let navitems = Object.keys(Pages).map(x => {
            return <Nav.Item href={x} active={this.state.mode === x}>{Pages[x]}</Nav.Item>
        });
        console.log(navitems);

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
