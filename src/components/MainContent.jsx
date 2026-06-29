import axios from "axios";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Prayer from "./Prayer";

const RWANDA_TIME_ZONE = "Africa/Kigali";

const INITIAL_TIMINGS = {
	Fajr: "04:52",
	Dhuhr: "11:59",
	Asr: "15:18",
	Maghrib: "18:02",
	Isha: "19:03",
};

const RWANDA_LOCATIONS = [
	{
		displayName: "Kigali, Rwanda",
		city: "Kigali",
		country: "Rwanda",
	},
];

const PRAYERS = [
	{
		key: "Fajr",
		displayName: "Fajr",
		image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=80",
	},
	{
		key: "Dhuhr",
		displayName: "Dhuhr",
		image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
	},
	{
		key: "Asr",
		displayName: "Asr",
		image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
	},
	{
		key: "Maghrib",
		displayName: "Maghrib",
		image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80",
	},
	{
		key: "Isha",
		displayName: "Isha",
		image: "https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop&w=900&q=80",
	},
];

function getRwandaMoment() {
	const parts = new Intl.DateTimeFormat("en-GB", {
		timeZone: RWANDA_TIME_ZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	}).formatToParts(new Date());

	const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

	return moment(
		`${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`,
		"YYYY-MM-DD HH:mm:ss"
	);
}

function formatDuration(milliseconds) {
	const duration = moment.duration(Math.max(milliseconds, 0));
	const hours = String(Math.floor(duration.asHours())).padStart(2, "0");
	const minutes = String(duration.minutes()).padStart(2, "0");
	const seconds = String(duration.seconds()).padStart(2, "0");

	return `${hours}:${minutes}:${seconds}`;
}

export default function MainContent() {
	const [nextPrayerIndex, setNextPrayerIndex] = useState(0);
	const [timings, setTimings] = useState(INITIAL_TIMINGS);
	const [remainingTime, setRemainingTime] = useState("00:00:00");
	const [selectedLocation, setSelectedLocation] = useState(RWANDA_LOCATIONS[0]);
	const [today, setToday] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	const nextPrayer = PRAYERS[nextPrayerIndex];

	const apiUrl = useMemo(() => {
		const params = new URLSearchParams({
			city: selectedLocation.city,
			country: selectedLocation.country,
			method: "2",
		});

		return `https://api.aladhan.com/v1/timingsByCity?${params.toString()}`;
	}, [selectedLocation]);

	useEffect(() => {
		const getTimings = async () => {
			setIsLoading(true);
			setError("");

			try {
				const response = await axios.get(apiUrl);
				const prayerTimings = response.data.data.timings;

				setTimings({
					Fajr: prayerTimings.Fajr,
					Dhuhr: prayerTimings.Dhuhr,
					Asr: prayerTimings.Asr,
					Maghrib: prayerTimings.Maghrib,
					Isha: prayerTimings.Isha,
				});
			} catch {
				setError("Live prayer times are temporarily unavailable. Showing saved Kigali timings.");
			} finally {
				setIsLoading(false);
			}
		};

		getTimings();
	}, [apiUrl]);

	useEffect(() => {
		const setupCountdownTimer = () => {
			const rwandaNow = getRwandaMoment();
			setToday(rwandaNow.format("dddd, MMMM D, YYYY | HH:mm"));

			const prayerMoments = PRAYERS.map((prayer) => {
				const prayerTime = moment(timings[prayer.key], "HH:mm");
				return rwandaNow
					.clone()
					.hour(prayerTime.hour())
					.minute(prayerTime.minute())
					.second(0);
			});

			let upcomingPrayerIndex = prayerMoments.findIndex((time) => time.isAfter(rwandaNow));

			if (upcomingPrayerIndex === -1) {
				upcomingPrayerIndex = 0;
				prayerMoments[0].add(1, "day");
			}

			setNextPrayerIndex(upcomingPrayerIndex);
			setRemainingTime(formatDuration(prayerMoments[upcomingPrayerIndex].diff(rwandaNow)));
		};

		setupCountdownTimer();
		const interval = setInterval(setupCountdownTimer, 1000);

		return () => clearInterval(interval);
	}, [timings]);

	const handleLocationChange = (event) => {
		const location = RWANDA_LOCATIONS.find((item) => item.city === event.target.value);
		setSelectedLocation(location);
	};

	return (
		<section className="content-panel" aria-label="Rwanda prayer schedule">
			<div className="hero-section">
				<div className="hero-copy">
					<p className="eyebrow">Rwanda Time Zone</p>
					<h1>Prayer times for {selectedLocation.displayName}</h1>
					<p>
						All prayer times and the live countdown are shown in Central Africa Time
						(CAT), timezone {RWANDA_TIME_ZONE}.
					</p>
				</div>

				<div className="countdown-panel" aria-live="polite">
					<span>Next Prayer</span>
					<strong>{nextPrayer.displayName}</strong>
					<div>{remainingTime}</div>
					<small>{today}</small>
				</div>
			</div>

			{error && (
				<Alert severity="warning" className="status-alert">
					{error}
				</Alert>
			)}

			<Divider className="section-divider" />

			<section id="schedule" className="schedule-section">
				<div className="section-heading">
					<div>
						<p className="eyebrow">Daily Schedule</p>
						<h2>Today&apos;s prayer times</h2>
					</div>

					{isLoading && (
						<Box className="loading-indicator" aria-label="Loading live prayer times">
							<CircularProgress size={22} />
							<span>Updating</span>
						</Box>
					)}
				</div>

				<div className="prayer-grid">
					{PRAYERS.map((prayer, index) => (
						<Prayer
							key={prayer.key}
							name={prayer.displayName}
							time={timings[prayer.key]}
							image={prayer.image}
							isNext={index === nextPrayerIndex}
						/>
					))}
				</div>
			</section>

			<section id="location" className="location-section">
				<Stack direction="row" justifyContent="center">
					<FormControl className="location-select">
						<InputLabel id="location-select-label">Location</InputLabel>
						<Select
							labelId="location-select-label"
							id="location-select"
							value={selectedLocation.city}
							label="Location"
							onChange={handleLocationChange}
						>
							{RWANDA_LOCATIONS.map((location) => (
								<MenuItem value={location.city} key={location.city}>
									{location.displayName}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Stack>
			</section>
		</section>
	);
}
