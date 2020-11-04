import * as React from "react";
// import moment from "moment";
import {Transposit} from "transposit";
import {Checkbox} from "rsuite";
import {Car} from "./carbooker";

const transposit = new Transposit(
    "https://lmc-carshare-89gbj.transposit.io"
);

interface RequestListProps {
    user: { name: string; email: string; };
}

interface RequestListState {
    requests: Request[];
    isLoading: boolean;
    errorMessage: string;
}

export class RequestList extends React.Component<RequestListProps, RequestListState> {
    constructor(props) {
        super(props);
        this.state = {
            requests: [],
            isLoading: false,
            errorMessage: ""
        };
        this.updateRequests = this.updateRequests.bind(this);
        this.updateRequestsSuccess = this.updateRequestsSuccess.bind(this);
        this.updateRequests();
    }

    async updateRequests() {
        this.setState({isLoading: true});
        await transposit
            .run("list_requests", {})
            .then(this.updateRequestsSuccess)
            .catch(response => {
                this.setState( {errorMessage: response.toString(), isLoading: false});
            });
    }

    updateRequestsSuccess(results) {
        let requests = results.results;
        requests.shift();
        let filtered_requests = requests.filter(x => {
            if (x.requester === this.props.user.email) {
                return true;
            }
            return false;
        });
        this.setState({
            requests: filtered_requests,
            isLoading: false
        });
        return filtered_requests;
    }

    render() {
        let requests = this.state.requests.map(
            x => {
                let approval = "";
                if (!x.confirmed) {
                    approval = " (awaiting approval)";
                }
                return (
                    <Checkbox value={x.eventId}>
                        {x.vehicle.Description} booked for {x.start} to {x.end}{approval}
                    </Checkbox>
                );
            });
        return (
            <div>
                {requests}
            </div>
        );
    };
}

interface Request {
    "threadId": string;
    "vehicle": Car;
    "requester": string;
    "start": string;
    "end": string;
    "eventId": string;
    "confirmed": boolean;
}