var SummaryMain = React.createClass({
  getInitialState: function() {
    return {
      quoteText: '',
      quotes: [],
      index: -1
    };
  },

  componentDidMount: function() {
    this.loadQuotes();
  },

  loadQuotes: function() {
    $.get("/quote", function(result) {
      this.setState({
        quotes: result
      });
      var renderedRows = [];
      var resultArray = _.values(result);
      var sortedResults = _.sortBy(resultArray, function(row) {
        return -row['score'];
      });
      sortedResults.forEach(function(quote) {
        var quoteRow = (

            <tr>
              <td><a href={"/?quoteId=" + quote.id}> {quote.text}</a></td>
              <td data-value={parseInt(quote.score)}>{parseInt(quote.score)}</td>
            </tr>

        );
        renderedRows.push(quoteRow);
      });
      this.setState({renderedRows: renderedRows});
      Sortable.init();
    }.bind(this));
  },

  render: function() {
    return (
        <div className="site-wrapper">
          <div className="site-wrapper-inner">
            <div className="cover-container">
              <div className="inner cover">
                <h1>Лучшие отмазки</h1>

                <form>
                  <div className="table-responsive">
                    <table className="table table-bordered" data-sortable>
                      <thead>
                      <tr className="table-header">
                        <th>Отмазка</th>
                        <th>Рейтинг</th>
                      </tr>
                      </thead>
                      <tbody>
                      {this.state.renderedRows}
                      </tbody>
                    </table>
                  </div>

                  <div className="admin-buttons">
                    Хотите помочь сайту? <a href="/">Голосуйте</a> за хорошие отмазки!
                  </div>

                </form>

              </div>
            </div>
          </div>
        </div>

    );
  }
});

ReactDOM.render(<SummaryMain />, document.body);
