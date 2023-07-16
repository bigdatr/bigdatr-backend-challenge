import express, { Request, Response } from 'express';
import config from '../config';

const app = express();

interface Build {
  id: number;
}

interface Release {
  id: number;
  parent_id: number | null;
  builds: Build[];
}

export async function getReleaseWithBuilds(id: number): Promise<Release> {

  const {db} = await config();
  const release: Release = await db.one('SELECT * FROM releases WHERE id = $1', [id]);
  release.builds = await db.manyOrNone('SELECT * FROM release_selections WHERE release_id = $1', [id]);
  
  return release;
}

export async function getReleaseLineage(id: number): Promise<Release[]> {
  let release = await getReleaseWithBuilds(id);
  let lineage: Release[] = [release];

  while (release.parent_id !== null) {
    const parentRelease = await getReleaseWithBuilds(release.parent_id);
    lineage.push(parentRelease);
    release = parentRelease;
  }

  lineage = lineage.map(release => ({
    ...release,
    builds: release.builds.sort((a, b) => b.id - a.id)
  }));

  lineage.sort((a, b) => b.id - a.id);

  return lineage;
}

app.post('/releaseLineage', async (req: Request, res: Response) => {
  const releaseId = req.body.releaseId;
  try {
    const lineage = await getReleaseLineage(releaseId);
    res.json(lineage);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


const port = 3000; 

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});