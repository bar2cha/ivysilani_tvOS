import ATV from 'atvjs'
import fastXmlParser from 'fast-xml-parser'

import template from './template.hbs'
import API from 'lib/ivysilani.js'

var AlphabetLetterPage = ATV.Page.create({
  name: 'programme-list',
  template: template,
  ready: function (options, resolve, reject) {
    // ATV.Navigation.showLoading({data : {message: 'Načítání'}});
    // Paging support
    let currentPage
    let showInfo
    if ('paging' in options) { currentPage = options.paging.nextPage } else { currentPage = '1' }
    if ('showInfo' in options) { showInfo = options.showInfo } else { showInfo = options }
    // Dalsi epizody poradu
    if ('SIDP' in options) { options.ID = options.SIDP }

    let getProgrammeList = ATV.Ajax.post(API.url.programmeList, API.xhrOptions(
      {
        ID: showInfo.ID,
        'paging[episodes][currentPage]': currentPage,
        'paging[episodes][pageSize]': 20,
        'type[0]': 'episodes',
        'type[1]': 'related',
        'type[2]': 'bonuses'
      }
    ))

    // Then resolve them at once
    // Old template {{{programmeImg ../showInfo.ID ID}}}
    Promise
      .all([getProgrammeList])
      .then((xhrs) => {
        let programmeList = fastXmlParser.parse(xhrs[0].response).programmes
        console.log(programmeList)
        console.log(xhrs[0].response)

        // Modifikace pagování
        if (programmeList.episodes.paging.pagesCount === '1') { delete programmeList.episodes.paging }

        // Je to film nebo seriál?
        if (!(programmeList.episodes.programme.constructor === Array)) { programmeList.episodes.programme = [programmeList.episodes.programme] }

        resolve({
          showInfo: showInfo,
          paging: programmeList.episodes.paging,
          episodes: programmeList.episodes.programme
        })
      }, (xhr) => {
        // error
        reject()
      })

    /*
        // get the unique id of the asset
        let letterLink = options.link;

        // load data and then resolve promise
        ATV.Ajax
        //.get(API.listLetter(letterLink))
            .get('http://hd-tech.cz/most.php?url=http://hbbtv.ceskatelevize.cz/ivysilani/services/letter.php?letter=a')
            .then((xhr) => {
                let shows = xhr.response;

                resolve({
                    shows: shows.programme
                });
            }, (xhr) => {
                // error
                reject();
            });
        // for demo using static content
//      resolve(staticData());
        */
  }
})

export default AlphabetLetterPage