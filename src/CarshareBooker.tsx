import * as React from "react";

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
}
