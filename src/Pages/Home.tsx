import { VillaCompactView, VillaFaciliteiten } from './Villa/Villa';
import { PhotoSlider } from '../photoslider/Photoslider';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import * as ReactMarkdown from 'react-markdown';
import * as React from 'react';
import './Home.css';
import { ChateauItem, ChateauListViewComponent, ChateauPost } from './Chateau/Chateau';
import {
  CHATEAU_CONTENT_TYPE_ID,
  ContentfulClient,
  SLIDER_PHOTO_CONTENT_TYPE_ID,
  VILLAS_CONTENT_TYPE_ID,
} from '../Contentful';
import { ContentfulClientApi, Entry, EntryCollection } from 'contentful';
import { Photo, SliderPhotoContentModel } from '../photoslider/Types';
interface State {
  introClosed: boolean;
  chateauPosts?: Entry<ChateauPost>[];
  sliderPhotos?: Photo[];
  villaFaciliteiten?: VillaFaciliteiten[];
}

export class Home extends React.Component<{}, State> {
  client: ContentfulClientApi = ContentfulClient;
  state = {
    introClosed: false,
    chateauPosts: [],
    sliderPhotos: [],
    villaFaciliteiten: []
  };
  constructor() {
    super();
    this.initPhotoSliderContentState();
    this.initChateauContentState();
    this.initVillaFaciliteitenState();
  }
  initVillaFaciliteitenState() {
    return this.client.getEntries({
      content_type: VILLAS_CONTENT_TYPE_ID,
      select: ['fields.faciliteiten,fields.title,fields.prijsVanaf']
    })
      .then(entries => entries.items.map((villa: Entry<VillaFaciliteiten>) => {
        return {
          id: villa.sys.id,
          title: villa.fields.title,
          faciliteiten: villa.fields.faciliteiten,
          prijsVanaf: villa.fields.prijsVanaf
        };
      }))
      .then((faciliteiten) => {
        this.setState({
          ... this.state,
          villaFaciliteiten: faciliteiten
        });
      });
  }
  initPhotoSliderContentState() {
    return this.client.getEntries({
      content_type: SLIDER_PHOTO_CONTENT_TYPE_ID,
      'fields.page.sys.id[all]': 'CpAKWj8P7iWggMwIkm4K2'
    })
      .then((content: EntryCollection<SliderPhotoContentModel>) => content.items.map(photo => {
        return {
          original: photo.fields.image.fields.file.url,
          thumbnail: photo.fields.image.fields.file.url
        };
      }))
      .then((photos) => {
        this.setState({ ...this.state, sliderPhotos: photos });
        return photos;
      });
  }

  initChateauContentState(): Promise<EntryCollection<ChateauPost>> {
    return this.client.getEntries({ content_type: CHATEAU_CONTENT_TYPE_ID })
      .then((content) => {
        this.setState({ ...this.state, chateauPosts: content.items });
        return content;
      });
  }
  render() {
    return (
      <div className="container">
        <section className="image-intro">
          {this.renderIntroHeader()}
          <PhotoSlider
            items={this.state.sliderPhotos}
            closed={this.state.introClosed}
            onClose={() => this.onIntroClose()}
          />
        </section>
        <ChateauListViewComponent>
          {this.state.chateauPosts
            .map((item: Entry<ChateauPost>) => <ChateauItem key={item.fields.slug} item={item} />)}
        </ChateauListViewComponent>
        <VillaCompactView>
          { this.state.villaFaciliteiten.length > 0 ?
          <Tabs defaultIndex={0} >
            <TabList>
             { this.state.villaFaciliteiten.map((faciliteiten: VillaFaciliteiten, i) =>
              <Tab key={faciliteiten.id} tabIndex={i.toString()}> {faciliteiten.title}</Tab>)}
            </TabList>

           { this.state.villaFaciliteiten.map((faciliteiten: VillaFaciliteiten, i) => 
            <TabPanel key={faciliteiten.id}>
            <ReactMarkdown source={faciliteiten.faciliteiten} />
            <span className="prijs"><span>Vanaf </span> {faciliteiten.prijsVanaf} <span> per week</span></span>
            <button className="button yellow">Villa informatie & beschikbaarheid</button>
           </TabPanel>)}
          </Tabs>
          : ''}
        </VillaCompactView>
        <section>Villa</section>
        <section>Omgeving</section>
        <button className="button">Meer informatie</button>
      </div>
    );
  }
  onIntroClose() {
    this.setState({ introClosed: true });
  }
  renderIntroHeader() {
    return (
      <header className={this.state.introClosed ? 'hidden' : ''}>
        <span className="close" onClick={() => this.onIntroClose()}>X</span>
        <figure>
          <img src="./logo.png" alt="Logo" />
          <h1><span>Goed in</span> Frankrijk</h1>
        </figure>
        <hr />
        <ul>
          <li>Kindvriendelijk</li>
          <li>Luxe vakantie-villa's</li>
          <li>Persoonlijk contact</li>
        </ul>
        <p>Zeven eigenaren van luxe vakantie-villa's
          gelegen in Zuid-Frankrijk hebben zich verenigd in een stichting.
          Dit om zich te kunnen onderscheiden in mooie en luxe ingerichte villa's met een
          echt thuisgevoel. Wij zijn er voor uw gemakken en een mooie vakantie.
        </p>
      </header>
    );
  }
}