import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import audioBookPlaylist from './data.js';


export default class App extends React.Component {
	state = {
		isPlaying: false,
		playbackInstance: null,
		currentIndex: 0,
		volume: 1.0,
		isBuffering: true
	}

	async componentDidMount() {
		try {
			await Audio.setAudioModeAsync({
				allowsRecordingIOS: false,
				interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
				playsInSilentModeIOS: true,
				interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
				shouldDuckAndroid: true,
				staysActiveInBackground: true,
				playThroughEarpieceAndroid: true
			})

			this.loadAudio()
		} catch (e) {
			console.log(e)
		}
	}

	async loadAudio() {
		const { currentIndex, isPlaying, volume } = this.state

		try {
			const playbackInstance = new Audio.Sound()
			const source = {
				uri: audioBookPlaylist[currentIndex].uri
			}

			const status = {
				shouldPlay: isPlaying,
				volume: volume
			}

			playbackInstance.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate)
			await playbackInstance.loadAsync(source, status, false)
			this.setState({
				playbackInstance
			})
		} catch (e) {
			console.log(e)
		}
	}

	onPlaybackStatusUpdate = status => {
		this.setState({
			isBuffering: status.isBuffering
		})
	}

	handlePlayPause = async () => {
		const { isPlaying, playbackInstance } = this.state
		isPlaying ? await playbackInstance.pauseAsync() : await playbackInstance.playAsync()

		this.setState({
			isPlaying: !isPlaying
		})
	}

	handlePreviousTrack = async () => {
		let { playbackInstance, currentIndex } = this.state
		if (playbackInstance) {
			await playbackInstance.unloadAsync()
			this.setState({
				currentIndex : (currentIndex === 0 ? audioBookPlaylist.length -1 : currentIndex-1)
			});
			this.loadAudio()
		}
	}

	handleNextTrack = async () => {
		let { playbackInstance, currentIndex } = this.state
		if (playbackInstance) {
			await playbackInstance.unloadAsync()
			this.setState({
				currentIndex: (currentIndex+1 > audioBookPlaylist.length - 1 ? 0 : currentIndex+1)
			});
			this.loadAudio()
		}
	}

	renderFileInfo() {
		const { playbackInstance, currentIndex } = this.state
		return playbackInstance ? (
			<View style={styles.trackInfo}>
				<Text style={{fontWeight:'bold',fontSize:30,color:'#fff'}}>
					{audioBookPlaylist[currentIndex].title}
				</Text>
				<Text style={{fontWeight:'bold',fontSize:15,color:'#fff'}}>
					{audioBookPlaylist[currentIndex].author}
				</Text>
        <Text style={{fontWeight:'bold',fontSize:15,color:'#fff'}}>
					Source : {audioBookPlaylist[currentIndex].source}
				</Text>
			</View>
		) : null
	}
  renderFileIMG() {
		const { playbackInstance, currentIndex } = this.state
		return playbackInstance ? (
				<Image
					style={styles.albumCover}
					source={audioBookPlaylist[currentIndex].imageSource}
				/>
		) : null
	}

	render() {
		return (
			<View style={styles.container}>
      <View style={styles.container2}>
      	{this.renderFileIMG()}
			{this.renderFileInfo()}
				<View style={styles.controls}>
					<TouchableOpacity style={styles.control} onPress={this.handlePreviousTrack}>
						<Ionicons name="play-skip-back-sharp"size={48} color='#fff' />
					</TouchableOpacity>
					<TouchableOpacity style={styles.control} onPress={this.handlePlayPause}>
						{this.state.isPlaying ? (
							<Ionicons name='pause-circle-sharp' size={70} color='#fff' />
						) : (
							<Ionicons name='play-circle-sharp' size={70} color='#fff' />
						)}
					</TouchableOpacity>
					<TouchableOpacity style={styles.control} onPress={this.handleNextTrack}>
						<Ionicons name="play-skip-forward-sharp" size={48} color='#fff' />
					</TouchableOpacity>
				</View>
			</View>
      </View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#637175',
		alignItems: 'center',
   
	
	},
  	container2: {
		flex: 1,
		backgroundColor: 'grey',
		alignItems: 'center',
    justifyContent:'center',
    paddingHorizontal:20	,
    borderRadius:30,
    marginVertical:20
	},
	albumCover: {
		width: 270,
		height: 270,
    borderRadius:10,
	},
	trackInfo: {
		marginVertical:20,
		backgroundColor: '#4a5659',
    borderRadius:20,
    paddingHorizontal:44,
    paddingVertical:20
   
	},
	control: {
		margin: 10,
	},
	controls: {
		flexDirection: 'row',
    	alignItems: 'center',
		justifyContent: 'center',
	}
})
