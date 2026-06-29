/* eslint-disable react/prop-types */
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";

export default function Prayer({ name, time, image, isNext }) {
	return (
		<Card className={`prayer-card ${isNext ? "is-next" : ""}`}>
			<CardMedia className="prayer-image" image={image} title={`${name} prayer`} />
			<CardContent className="prayer-content">
				<div>
					<Typography component="h3" className="prayer-name">
						{name}
					</Typography>
					{isNext && <span className="next-badge">Next</span>}
				</div>

				<Typography component="p" className="prayer-time">
					{time}
				</Typography>
			</CardContent>
		</Card>
	);
}
