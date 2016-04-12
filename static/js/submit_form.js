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
      newQuoteText: ''
    };
  },

  handleChange: function(evt) {
    this.setState({
      newQuoteText: evt.target.value
    });
  },

  submit: function(e) {
    if (this.state.newQuoteText == "") {
      return e.preventDefault();
    }
    $('button').prop('disabled', true);
    $.ajax({
      type: 'POST',
      url: "/quote",
      data: JSON.stringify({text: this.state.newQuoteText}),
      contentType: "application/json; charset=utf-8",
      success: function(result) {
        $('button').prop('disabled', false);
        this.setState({
          newQuoteText: ""
        });
        window.forceQuote(result.text);
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
                       placeholder="Напиши свою отмазку" value={this.state.newQuoteText}/>
              </div>
              <button onClick={this.submit} className="btn btn-lg btn-success">Всё так и было, ага</button>
            </form>
          </div>
        </div>
    );
  }
});
