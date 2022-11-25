import React, { FC } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { ImageListItem, ImageListItemBar, Box } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material';

type ChartProps = {
  data: Object[]
}

const Image = styled('img')({
  width: '300px',
  height: '300px',
  objectFit: 'cover'
});

const Chart: FC<ChartProps> = ({ data }) => {
  return (
      <Grid container spacing={{ xs: 1, md: 2 }} columns={{ xs: 3, md: 5 }} justifyContent={'center'}>
        {data.map((artist: any) => (
          <Grid>
            <ImageListItem key={artist.id}>
              <Image src={artist.images[0].url} />
              <ImageListItemBar
                title={artist.name}
                actionIcon={
                  <InfoIcon />
                }
              />
            </ImageListItem>
          </Grid>
        ))}
      </Grid>
  )
}

export default Chart;
