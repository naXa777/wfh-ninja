var SubmitButton = React.createClass({
  render: function() {
    return (
        <a {...this.props}
            href="javascript:;"
            role="button"
            className={(this.props.className || '') + ' btn'}/>
    );
  }
});

var SubmitForm = React.createClass({
  getInitialState: function() {
    return {
      quoteText: ''
    };
  },

  handleChange: function(evt) {
    this.setState({
      quoteText: evt.target.value
    });
  },

  submit: function(e) {
    if (this.state.quoteText == "") {
      return e.preventDefault();
    }
    $('button').prop('disabled', true);
    $.ajax({
      type: 'POST',
      url: "/quote",
      data: JSON.stringify({text: this.state.quoteText}),
      contentType: "application/json; charset=utf-8",
      success: function(result) {
        $('button').prop('disabled', false);
        this.setState({
          quoteText: ""
        });
        window.forceQuote(result.id);
        window.scrollUp();
      }.bind(this)
    });
    return e.preventDefault();
  },

  render: function() {
    return (
        <div className="site-wrapper-inner-auto">
          <div className="cover-container submit-quote">
            <form onSubmit={this.submit} className="inner cover">
              <div className="form-group new-quote">
                <label htmlFor="suggestedQuote" className="lead">Сегодня я опоздал(а) на работу в связи с тем, что...</label>
                <input type="text" className="form-control input-lg" onChange={this.handleChange}
                       placeholder="Напиши свою отмазку" value={this.state.quoteText}/>
              </div>
              <button onClick={this.submit} className="btn btn-lg btn-success">Всё так и было, ага</button>
            </form>
          </div>
        </div>
    );
  }
});
