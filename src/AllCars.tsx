import * as React from "react";
import {Car, User} from "./types";
import {ThunkDispatch} from "@reduxjs/toolkit";
import {connect} from "react-redux";
import {Loader} from "rsuite";

interface AllCarsProps {
    user: User;
    cars: Car[];
    status: string;
    error: string;
    dispatch: ThunkDispatch<any, any, any>;
}

interface AllCarsState {
}

export class AllCars extends React.Component<AllCarsProps, AllCarsState> {
    render() {
        if (this.props.status === "loading") {
            return (
                <div>
                    <Loader size="lg" center content="Loading" vertical/>
                </div>
            );
        }
        let car_list = this.props.cars.map(car => {
            return (<li>{car.Description}</li>);
        })
        return (
            <div className="calendar">
                <ul>
                    {car_list}
                </ul>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user.user,
        cars: state.cars.entries,
        status: state.cars.status,
        error: state.cars.error,
    };
}
export default connect(mapStateToProps)(AllCars)
