loadRecords = function(records) {
	records = JSON.parse(records);
	
	var RecordsStore = {};
	
	//CONSTANTS
	RecordsStore.constants = {
		EDIT_RECORD: "EDIT_RECORD",
		DELETE_RECORD: "DELETE_RECORD",
		ADD_RECORD: "ADD_RECORD"
	};
	
	//STORE
	RecordsStore.store = Fluxxor.createStore({
		
		initialize: function(options) {
		this.records = options.records || [];
		this.bindActions(RecordsStore.constants.EDIT_RECORD, this.onEditRecord, RecordsStore.constants.DELETE_RECORD, this.onDeleteRecord, RecordsStore.constants.ADD_RECORD, this.onAddRecord);
		},
		
		getState: function() {
			return {
				records: this.records,
			};
		},
		
		onEditRecord: function(payload) {
			payload.record.date = payload.data.date;
			payload.record.title = payload.data.title;
			payload.record.amount = payload.data.amount;
			this.emit("change");
		},
		
		onDeleteRecord: function(payload) {
			this.records = this.records.filter(function(record) {
				return record.id != payload.record.id
			});
			
			this.emit("change");
		},
		
		onAddRecord: function(payload) {
			this.records.push(payload.data);
			this.emit("change");
		}
	});
  
	//ACTIONS
	RecordsStore.actions = {
		editRecord: function(record, data) {
			this.dispatch(RecordsStore.constants.EDIT_RECORD, {
				record: record,
				data: data
			});
			$.ajax({
				method: "PUT",
				url: "/records/" + record.id,
				data: {record: data},
				success: function() {
				},
				failure: function() {
				}
			});
		},
		deleteRecord: function(record) {    
			this.dispatch(RecordsStore.constants.DELETE_RECORD, {
				record: record
			});
			$.ajax({
				method: "DELETE",
				url: "/records/" + record.id,
				success: function() {
				},
				failure: function() {
				}
			});
		},
		
		addRecord: function(data) {    
			this.dispatch(RecordsStore.constants.ADD_RECORD, {
				data: data
			});
			$.ajax({
				method: "POST",
				url: "/records/",
				data: {record: data},
				success: function() {
				},
				failure: function() {
				}
			});
		}
	};
  
	//INIT
	RecordsStore.init = function(records) {
		var tempStore = {
			RecordsStore: new RecordsStore.store({
				records: records
			})
		};
		RecordsStore.flux = new Fluxxor.Flux(tempStore, RecordsStore.actions);
	}
  
  
	//REACT COMPONENTS
	//Records
	var Records = React.createClass({
		
		mixins: [Fluxxor.FluxMixin(React), Fluxxor.StoreWatchMixin("RecordsStore")],
		
		getStateFromFlux: function() {
			var flux = this.getFlux();
			return {
				records: flux.store("RecordsStore").getState().records
			};
		},

		credit: function(){
			var credit = this.state.records.filter(function(val){
				return val.amount >= 0;	
			});
		return credit.reduce((function(prev,curr) {return prev + parseFloat(curr.amount);}), 0);
		},
		
		debit: function(){
			var debit = this.state.records.filter(function(val){
				return val.amount < 0;	
			});
		return debit.reduce((function(prev,curr) {return prev + parseFloat(curr.amount);}), 0);
		},
		
		balance: function(){
			return this.credit()+this.debit();
		},
		
		render: function() {
			var props = this.props;
			var records = this.state.records.map(function (record) {
				return <Record record={record} key={record.id} flux={props.flux} />
			});
			var recordForm = <RecordForm  flux={props.flux} />;
	
			return (        
				<div className="records">
					<h2 className="Title">Records</h2>
					<div className="row">
						<AmountBox type="success" text="Credit" amount={this.credit()} flux={props.flux} />
						<AmountBox type="danger" text="Debit" amount={this.debit()} flux={props.flux} />
						<AmountBox type="info" text="Balance" amount={this.balance()} flux={props.flux} />
					</div>
					{recordForm}
					<hr>
						<table className="table table-bordered">
							<thead>
								<tr>
									<th>Date</th>
									<th>Title</th>
									<th>Amount</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
							{records}
							</tbody>
						</table>
					</hr>
				</div>
			);
		}
	});
				
	//Record
	var Record = React.createClass({
		mixins: [Fluxxor.FluxMixin(React)],
    
		getInitialState: function() {
			return {edit: false};
		},
		
		handleToggle: function(e) {
			e.preventDefault();
			this.setState({edit: !this.state.edit});
		},
		
		handleEdit: function(e) {
			e.preventDefault();
			var data = {
				title: React.findDOMNode(this.refs.title).value,
				date: React.findDOMNode(this.refs.date).value,
				amount: React.findDOMNode(this.refs.amount).value
			};
			this.getFlux().actions.editRecord(this.props.record,data);
			this.setState({edit: false});
		},
		
		handleDelete: function(e) {
			e.preventDefault();
			this.getFlux().actions.deleteRecord(this.props.record);	
		},
		
		render: function() {
			return (
				<tr> 
				{
				this.state.edit ?
					//How to do differently ? key="N" is ugly
					[<td ><input className="form-control" type="text" defaultValue={this.props.record.date} ref="date"></input></td>, 
					<td><input className="form-control" type="text" defaultValue={this.props.record.title} ref="title"></input></td>,
					<td><input className="form-control" type="number" defaultValue={this.props.record.amount} ref="amount"></input></td>,
					<td><a href="#" className="btn btn-default col-md-4" onClick={this.handleEdit}>Update</a><a href="#" className="btn btn-danger col-md-4" onClick={this.handleToggle}>Cancel</a></td>]
				:	
					[<td>{this.props.record.date}</td>,   
					<td>{this.props.record.title}</td>,
					<td>$ {this.props.record.amount}</td>,
					<td><a href="#" className="btn btn-default col-md-4" onClick={this.handleToggle}>Edit</a><a href="#" className="btn btn-danger col-md-4" onClick={this.handleDelete}>Delete</a></td>]
				}
				</tr>
			)
		}
	});
	
	//RecordForm
	var RecordForm = React.createClass({
		mixins: [Fluxxor.FluxMixin(React)],
		
		getInitialState: function() {
			return {title: "", date: "", amount: ""};
		},
		
		valid: function() {
			return this.state.title && this.state.date && this.state.amount;
		},
	
		handleChange: function(e){
			name = e.target.name;
			this.setState(obj = {},obj["" + name] = e.target.value,obj);//very ugly !!
		},
		
		handleSubmit: function(e){
			e.preventDefault();
			var data = this.state;
			this.getFlux().actions.addRecord(data);
		},
		
		render: function() {
			return (
			<form className="form-inline" onSubmit={this.handleSubmit}>
				<div className="form-group">
					<input className="form-control" type="text" placeholder="Date" name="date" value={this.state.date} onChange={this.handleChange}>
					</input>
				</div>
				<div className="form-group">
					<input className="form-control" type="text" placeholder="Title" name="title" value={this.state.title} onChange={this.handleChange}>
					</input>
				</div>
				<div className="form-group">
					<input className="form-control" type="number" placeholder="Amount" name="amount" value={this.state.amount} onChange={this.handleChange}>
					</input>
				</div>
				<button className="btn btn-primary" type="submit" disabled={!this.valid()} >
					Create Record
				</button>
			</form>
			)
		}
		//pourquoi doit on faire valid() et pas valid ??
	});

	var AmountBox = React.createClass({
		mixins: [Fluxxor.FluxMixin(React)],
		
		render: function() {
			return (
				<div className="col-md-4">
					<div className={"panel panel-"+this.props.type}>
						<div className="panel-heading">
							{this.props.text}
						</div>
						<div className="panel-body">
							$ {this.props.amount}
						</div>
					</div>
				</div>

			)
		}
	});
	
	RecordsStore.init(records);
	React.render(<Records flux={RecordsStore.flux} />, document.body);
}

	

