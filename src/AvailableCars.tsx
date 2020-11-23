import * as React from "react";
import {Car, User} from "./types";
import {ThunkDispatch} from "@reduxjs/toolkit";
import {connect} from "react-redux";

interface AvailableCarsProps {
    user: User;
    cars: Car[];
    status: string;
    error: string;
    dispatch: ThunkDispatch<any, any, any>;
}

interface AvailableCarsState {
}

export class AvailableCars extends React.Component<AvailableCarsProps, AvailableCarsState> {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="calendar">
                cars
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user.user,
        cars: state.cars.entries,
        status: state.requests.status,
        error: state.requests.error,
    };
}
export default connect(mapStateToProps)(AvailableCars)
