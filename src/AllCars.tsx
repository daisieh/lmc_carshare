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

        // "Description": string;
        // "Features": string[];
        // "Email": string;
        // "Confirm": boolean;

        let car_list = this.props.cars.map(car => {
            let feat_list = car.Features.map(feat => {
                return (<li key={feat}>{feat}</li>);
            });
            return (
                <div key={car.Licence} className="car_item">
                    <h4 className="car_name">{car.Description}</h4>
                    <div className="car_features">
                        Features:
                        <ul>{feat_list}</ul>
                    </div>
                    <div className="car_confirm">{car.Confirm? "Requires owner approval for requests": ""}</div>
                    <div className="car_owner">Owner email: {car.Email}</div>
                </div>);
        })
        return (
            <div>
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
