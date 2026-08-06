CREATE TABLE public.rate_limit_counters (
  bucket text NOT NULL,
  identity text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (bucket, identity, window_start)
);

-- Server-only table: no grants to anon/authenticated, RLS on with no policies.
GRANT ALL ON public.rate_limit_counters TO service_role;
ALTER TABLE public.rate_limit_counters ENABLE ROW LEVEL SECURITY;

CREATE INDEX rate_limit_counters_window_idx ON public.rate_limit_counters (window_start);

-- Atomic fixed-window counter. Returns whether the call is allowed.
CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  _bucket text,
  _identity text,
  _limit integer,
  _window_seconds integer
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  _start timestamptz;
  _count integer;
BEGIN
  _start := to_timestamp(floor(extract(epoch from now()) / _window_seconds) * _window_seconds);

  INSERT INTO public.rate_limit_counters (bucket, identity, window_start, count)
  VALUES (_bucket, _identity, _start, 1)
  ON CONFLICT (bucket, identity, window_start)
  DO UPDATE SET count = public.rate_limit_counters.count + 1, updated_at = now()
  RETURNING count INTO _count;

  -- Opportunistic cleanup of stale windows.
  DELETE FROM public.rate_limit_counters
  WHERE window_start < now() - interval '2 days';

  RETURN jsonb_build_object(
    'allowed', _count <= _limit,
    'count', _count,
    'limit', _limit,
    'remaining', greatest(_limit - _count, 0),
    'reset_at', _start + make_interval(secs => _window_seconds)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(text, text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, text, integer, integer) TO service_role;
