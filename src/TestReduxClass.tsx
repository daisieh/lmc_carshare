import * as React from "react";
import {connect} from "react-redux";
const mapStateToProps = (state) => {
    return {features: state.allFeatures.features};
}

interface TestReduxClassProps {
    features: string[]
}
class TestReduxClass extends React.Component<TestReduxClassProps,{ }> {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>{this.props.features}</div>        );
    }
}

export default connect(mapStateToProps)(TestReduxClass)
