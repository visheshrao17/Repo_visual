type JobLike = {
  name: string;
  status: string;
  started_at?: string;
};

export const toJobGraph = (jobs: JobLike[]) => {
  const ordered = [...jobs].sort((a, b) => {
    const aTime = a.started_at ? new Date(a.started_at).getTime() : 0;
    const bTime = b.started_at ? new Date(b.started_at).getTime() : 0;
    return aTime - bTime;
  });

  const nodes = ordered.map((job) => ({
    id: job.name,
    status: job.status
  }));

  const edges = ordered
    .map((job, index) => {
      const nextJob = ordered[index + 1];
      if (!nextJob) {
        return null;
      }

      return {
        source: job.name,
        target: nextJob.name
      };
    })
    .filter((edge): edge is { source: string; target: string } => edge !== null);

  return { nodes, edges };
};
