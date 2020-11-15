import {CarshareBooker, User} from "./dataModel";
import * as React from "react";
import {Loader, Nav, Navbar} from "rsuite";
import {AvailableCars, BookingStatus, SearchAvailabilityForm} from "./carbooker";
import {RequestList} from "./requests";
import {CarCalendar} from "./carCalendar";
import {SignOut} from "./transpositFunctions";

export enum MODE {
    "BOOKING",
    "REQUESTS",
    "MYCAR",
    "CALENDAR",
    "CARS"
}

interface NavigationProps {
    user: User;
    isValid: number;
    mode: MODE;
}

interface NavigationState {
    mode: MODE;
    booker: CarshareBooker;
}

export class Navigation extends React.Component<NavigationProps, NavigationState> {
    constructor(props) {
        super(props);
        this.selectTab = this.selectTab.bind(this);
        this.state = {
            mode: this.props.mode,
            booker: new CarshareBooker({user: this.props.user})
        };
    };

    selectTab(eventKey) {
        this.setState({mode: eventKey});
    }

    render() {
        let main =
            <main className="container main">
                <Loader size="lg" center content="Loading" vertical/>
            </main>
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
                if (this.state.mode === MODE.BOOKING) {
                    main =
                        <main className="container main">
                            <SearchAvailabilityForm booker={this.state.booker}/>
                            <AvailableCars booker={this.state.booker}/>
                            <BookingStatus booker={this.state.booker}/>
                        </main>
                } else if (this.state.mode === MODE.REQUESTS) {
                    main =
                        <main className="container main">
                            <RequestList booker={this.state.booker}/>
                        </main>
                } else if (this.state.mode === MODE.MYCAR) {
                    main =
                        <main className="container main">
                            car
                        </main>
                } else if (this.state.mode === MODE.CALENDAR) {
                    main =
                        <main className="container main">
                            <CarCalendar booker={this.state.booker}/>
                        </main>
                } else if (this.state.mode === MODE.CARS) {
                    main =
                        <main className="container main">
                            cars
                        </main>
                }
            }
        }

        return (
            <>
                <Navbar className="navbar">
                    <Navbar.Header className="navbar-welcome">
                        Welcome, {this.props.user.name}
                    </Navbar.Header>
                    <Navbar.Body>
                        <Nav appearance="tabs" onSelect={this.selectTab}>
                            <Nav.Item eventKey={MODE.BOOKING} active={this.state.mode === MODE.BOOKING}>Book Car</Nav.Item>
                            <Nav.Item eventKey={MODE.REQUESTS} active={this.state.mode === MODE.REQUESTS}>Requests</Nav.Item>
                            <Nav.Item eventKey={MODE.MYCAR} active={this.state.mode === MODE.MYCAR}>My Car</Nav.Item>
                            <Nav.Item eventKey={MODE.CALENDAR} active={this.state.mode === MODE.CALENDAR}>Calendar</Nav.Item>
                            <Nav.Item eventKey={MODE.CARS} active={this.state.mode === MODE.CARS}>Cars</Nav.Item>
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
