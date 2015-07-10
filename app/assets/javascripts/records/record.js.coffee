@Record = React.createClass
  getInitialState: ->
    edit: false
	
  handleToggle: (e) ->
    e.preventDefault()
    @setState edit: !@state.edit

  addRecord: (record) ->
    records = @state.records.slice()
    records.push record
    @setState records: records
	
  handleDelete: (e) ->
    e.preventDefault()
    $.ajax
      method: 'DELETE'
      url: "/records/#{ @props.record.id }"
      dataType: 'JSON'
      success: () =>
        @props.handleDeleteRecord @props.record
		
  handleEdit: (e) ->
    e.preventDefault()
    data =
      title: React.findDOMNode(@refs.title).value
      date: React.findDOMNode(@refs.date).value
      amount: React.findDOMNode(@refs.amount).value
    # jQuery doesn't have a $.put shortcut method either
    $.ajax
      method: 'PUT'
      url: "/records/#{ @props.record.id }"
      dataType: 'JSON'
      data:
        record: data
      success: (data) =>
        @setState edit: false
        @props.handleEditRecord @props.record, data
		
  recordForm: ->
    React.DOM.tr null,
      React.DOM.td null,
        React.DOM.input
          className: 'form-control'
          type: 'text'
          defaultValue: @props.record.date
          ref: 'date'
      React.DOM.td null,
        React.DOM.input
          className: 'form-control'
          type: 'text'
          defaultValue: @props.record.title
          ref: 'title'
      React.DOM.td null,
        React.DOM.input
          className: 'form-control'
          type: 'number'
          defaultValue: @props.record.amount
          ref: 'amount'
      React.DOM.td null,
        React.DOM.a
          className: 'btn btn-default col-md-4'
          onClick: @handleEdit
          'Update'
        React.DOM.a
          className: 'btn btn-danger col-md-4'
          onClick: @handleToggle
          'Cancel'	
		  
  recordRow: ->
    React.DOM.tr null,
      React.DOM.td null, @props.record.date
      React.DOM.td null, @props.record.title
      React.DOM.td null, amountFormat(@props.record.amount)
      React.DOM.td null,
        React.DOM.a
          className: 'btn btn-default col-md-4'
          onClick: @handleToggle
          'Edit'
        React.DOM.a
          className: 'btn btn-danger col-md-4'
          onClick: @handleDelete
          'Delete'	
		  
  render: ->
    if @state.edit
      @recordForm()
    else
      @recordRow()
