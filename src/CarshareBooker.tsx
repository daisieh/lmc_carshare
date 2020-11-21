import * as React from "react";
import * as Transposit from "./fakeTranspositFunctions";
import {CarEvents} from "./types";

interface CarshareBookerProps {
}

interface CarshareBookerState {
    isProcessing: boolean;
    errorMessage: string;
}

export class CarshareBooker extends React.Component<CarshareBookerProps, CarshareBookerState> {
    constructor(props) {
        super(props);
        this.state = {
            errorMessage: "",
            isProcessing: false
        };
        // set the initial values for state:
    }

    render() {
        return (<div/>);
    }

    getThreeDays() :CarEvents {
        this.setState({isProcessing: true});
        let response = Transposit.getThreeDaysEvents();
        this.setState({
            isProcessing: false,
            errorMessage: response.error
        });
        return response.response;
    }
}
