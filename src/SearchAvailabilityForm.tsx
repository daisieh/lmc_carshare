import {makeEmptyRequest} from "./CarshareBooker";
import * as React from "react";
import moment from "moment";
import {Button, DatePicker, TagPicker} from "rsuite";
import {CarRequest, User} from "./types";
import {connect} from "react-redux";

interface SearchAvailabilityProps {
    user: User;
    features: string[];
}

interface SearchAvailabilityState {
    pendingRequest: CarRequest;
    startDate: Date;
    endDate: Date;
}

export class SearchAvailabilityForm extends React.Component<SearchAvailabilityProps, SearchAvailabilityState> {
    constructor(props) {
        super(props);
        this.state = {
            startDate: new Date(),
            endDate: new Date(),
            pendingRequest: makeEmptyRequest(this.props.user)
        }
        this.handleStartChange = this.handleStartChange.bind(this);
        this.handleEndChange = this.handleEndChange.bind(this);
        this.onLookForCars = this.onLookForCars.bind(this);
        this.onTagPick = this.onTagPick.bind(this);
    }

    handleStartChange(event) {
        let updated;
        if (event) {
            updated = this.updateTimes(event.toString(), "");
        } else {
            updated = this.updateTimes("", "");
        }
        this.setState({startDate: new Date(updated[0]), endDate: new Date(updated[1])});
    }

    handleEndChange(event) {
        let updated;
        if (event) {
            updated = this.updateTimes("", event.toString());
        } else {
            updated = this.updateTimes("", "");
        }
        this.setState({startDate: new Date(updated[0]), endDate: new Date(updated[1])});
    }

    onLookForCars() {
        // this.props.booker.getAvailableCars();
    }

    onTagPick(event) {
        // let req = this.props.booker.state.pendingRequest;
        // req.features = event as string[];
        // this.props.booker.setState({pendingRequest: req});
    }

    updateTimes(startTime: string, endTime: string) :[string, string]{
        let currentRequest = makeEmptyRequest(this.props.user);
        let newStart = moment(this.state.pendingRequest.start);
        let newEnd = moment(this.state.pendingRequest.end);

        // if both start and end are blank, we're resetting both
        if (startTime === "" && endTime === "") {
            newStart = moment().add(1, 'hour').startOf('hour');
            newEnd = moment().add(2, 'hour').startOf('hour');
        }
        console.log(`was ${newStart.format()} ${newEnd.format()}`);
        console.log(`asking for ${startTime} ${endTime}`);

        if (endTime !== "") {
            // we're setting the endTime,
            // so if the existing start is less than an hour before,
            // set the start to an hour before the end
            console.log(`comparing new end ${endTime} to ${newStart.format()}`);
            newEnd = moment(endTime);
            if (newStart.add(1, "hour").isAfter(newEnd)) {
                newStart = newEnd.clone().subtract(1, "hour");
                console.log(`...too soon, so set start to ${newStart}`);
            }
        } else if (startTime !== "") {
            // we're setting the startTime,
            // so if the existing end is less than an hour after,
            // set the end to an hour after the end
            console.log(`comparing new start ${startTime} to ${newEnd.format()}`);
            newStart = moment(startTime);
            if (newEnd.subtract(1, "hour").isBefore(newStart)) {
                newEnd = newStart.clone().add(1, "hour");
                console.log(`...too soon, so set end to ${newEnd}`);
            }
        }
        currentRequest.start = newStart.format();
        currentRequest.end = newEnd.format();
        this.setState({
            pendingRequest: currentRequest
        });
        console.log(`now ${currentRequest.start} ${currentRequest.end}`);
        return [currentRequest.start, currentRequest.end];
    }

    render() {
        let disabled = false;//(booker.state.availableCars && booker.state.availableCars.length > 0) || (booker.state.pendingRequest !== null);
        let inThePast = "";
        if (moment(this.state.pendingRequest.start).isBefore(moment())) {
            inThePast = "WARNING! The selected time slot is in the past.";
        }
        let feat_array:{label: string, value: string}[] = this.props.features.map(x => { return {"value": x, "label": x}; });
        // let feat_array:{label: string, value: string}[] = this.state.allFeatures.map(x => { return {"value": x, "label": x}; });
        // console.log(booker.state.allFeatures);
        // let feat_array = [{value:"foo", label:"bar"}];
        return (
            <div className="search-form">
                <p className={disabled?"caption-disabled":"caption"}>Select the date and time you'd like to book.</p>
                <div className="date-select">
                    <DatePicker
                        className="selector"
                        size="sm"
                        format="YYYY-MM-DD HH:mm"
                        onChange={this.handleStartChange}
                        value={this.state.startDate}
                        disabled={disabled}
                    />
                    <DatePicker
                        className="selector"
                        size="sm"
                        format="YYYY-MM-DD HH:mm"
                        onChange={this.handleEndChange}
                        value={this.state.endDate}
                        disabled={disabled}
                    />
                </div>
                <p className={disabled?"caption-disabled":"caption"}>Only select cars with all of these features:</p>
                <div className="feature-select">
                    <TagPicker
                        className="selector"
                        size="sm"
                        style={{width: 300}}
                        data={feat_array}
                        value={this.state.pendingRequest.features}
                        onChange={this.onTagPick}
                        disabled={disabled}
                    />
                </div>
                <Button
                    appearance="ghost"
                    className="selector"
                    loading={false}
                    size="sm"
                    onClick={this.onLookForCars}
                    disabled={disabled}
                >
                    Look for cars
                </Button>
                <div className="error">{inThePast}</div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {features: state.allFeatures.features};
}
export default connect(mapStateToProps)(SearchAvailabilityForm)
