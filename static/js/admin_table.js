var FormButton = React.createClass({
  render: function() {
    return (
        <button {...this.props}
            role="button"
            className={(this.props.className || '') + ' form-button'}/>
    );
  }
});

var AdminMain = React.createClass({
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
    $.get("/quote?all=true", function(result) {
      this.setState({
        quotes: result
      });
      var renderedRows = [];
      var padZeroes = function(input) {
        // pad 1 digit to 2 digits
        return ("0" + input).slice(-2);
      };
      Object.keys(result).forEach(function(key) {
        var quote = result[key];
        var date = new Date(quote.date_created);
        var formattedDate = date.getFullYear() + "-" + padZeroes(date.getMonth() + 1) + "-" + padZeroes(date.getDate()) + " " + padZeroes(date.getHours()) + ":" + padZeroes(date.getMinutes()) + ":" + padZeroes(date.getSeconds());
        var quoteRow = (

            <tr>
              <td className="checkbox-align" data-sortable="false">
                <input type="checkbox" name="checkbox" id={"checkbox" + quote.id} value={quote.id} />
              </td>
              <td data-sortable-type="numeric">{parseInt(quote.id)}</td>
              <td><a href={"/?quoteId=" + quote.id}> {quote.text}</a></td>
              <td className="text-nowrap">
                <span className={"glyphicon glyphicon-eye-" + (quote.active? "open" : "close")} /> {quote.active ? "Активна" : "Неактивна"}
              </td>
              <td>{formattedDate}</td>
              <td data-sortable-type="numeric">{parseInt(quote.score)}</td>
            </tr>

        );
        renderedRows.push(quoteRow);
      });
      this.setState({renderedRows: renderedRows});
      Sortable.init();
    }.bind(this));
  },

  approve: function() {
    return function() {
      let checkboxes = document.getElementsByName('checkbox');
      let promises = [];
      for (var i = 0, n = checkboxes.length; i < n; i++) {
        if (checkboxes[i].checked) {
          // approve it
          var request = $.ajax({
            type: 'PUT',
            url: "/quote/" + checkboxes[i].value + '/approve',
            contentType: "application/json; charset=utf-8"
          });
          promises.push(request);
          checkboxes[i].checked = false;
        }
      }
      $.when.apply(null, promises).done(this.loadQuotes.bind(this));
    }.bind(this);
  },

  reject: function() {
    return function() {
      let checkboxes = document.getElementsByName('checkbox');
      let promises = [];
      for (var i = 0, n = checkboxes.length; i < n; i++) {
        if (checkboxes[i].checked) {
          // reject it
          var request = $.ajax({
            type: 'PUT',
            url: "/quote/" + checkboxes[i].value + '/reject',
            contentType: "application/json; charset=utf-8"
          });
        }
        promises.push(request);
        checkboxes[i].checked = false;
      }
      $.when.apply(null, promises).done(this.loadQuotes.bind(this));
    }.bind(this);
  },

  delete: function() {
    return function() {
      if (!confirm('Вы уверены? Это действие необратимо!')) {
        return;
      }
      let checkboxes = document.getElementsByName('checkbox');
      for (var i = 0, n = checkboxes.length; i < n; i++) {
        if (checkboxes[i].checked) {
          // delete it
          var request = $.ajax({
            type: 'DELETE',
            url: "/quote/" + checkboxes[i].value,
            contentType: "application/json; charset=utf-8",
            async: false
          });
          promises.push(request);
          checkboxes[i].checked = false;
        }
      }
      this.loadQuotes();
    }.bind(this);
  },

  selectAll: function(f) {
    let checkboxes = document.getElementsByName('checkbox');
    for (var i = 0, n = checkboxes.length; i < n; i++) {
      checkboxes[i].checked = f.target.checked;
    }
  },

  logOut: function() {
    return function() {
      $.ajax({
        type: 'GET',
        url: "/logout",
        contentType: "application/json; charset=utf-8"
      });
    }.bind(this);
  },

  render: function() {
    return (
        <div className="site-wrapper">
          <div className="site-wrapper-inner">
            <div className="cover-container">
              <div className="inner cover">
                <div className="logout">
                  <a href="/logout">Выход</a>
                </div>
                <h1>Панель администратора</h1>

                <form>
                  <div className="table-responsive">
                    <table className="table table-bordered" data-sortable>
                      <thead>
                      <tr className="table-header">
                        <th className="checkbox-align"><input type="checkbox" onClick={this.selectAll}/></th>
                        <th>ID</th>
                        <th>Отмазка</th>
                        <th>Статус</th>
                        <th>Дата Создания</th>
                        <th>Рейтинг</th>
                      </tr>
                      </thead>
                      <tbody>
                      {this.state.renderedRows}
                      </tbody>
                    </table>
                  </div>

                  <div className="admin-buttons">
                    <FormButton onClick={this.reject()} className="btn btn-warning btn-lg">
                      <span className="glyphicon glyphicon-ban-circle" /> Отклонить
                    </FormButton>
                    <FormButton onClick={this.approve()} className="btn btn-success btn-lg">
                      <span className="glyphicon glyphicon-ok-circle" /> Одобрить
                    </FormButton>
                    <br />
                    <FormButton onClick={this.delete()} className="btn btn-danger btn-sm">
                      <span className="glyphicon glyphicon-trash" /> Удалить
                    </FormButton>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </div>

    );
  }
});

ReactDOM.render(<AdminMain />, document.body);
